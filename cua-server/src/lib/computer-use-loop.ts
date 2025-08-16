// lib/modules/computer-use-loop.ts
import { Page } from "playwright";
import {
  sendInputToModel,
  sendFunctionCallOutput,
} from "../services/openai-cua-client";
import { handleModelAction } from "../handlers/action-handler";
import logger from "../utils/logger";
import { Socket } from "socket.io";
import TestScriptReviewAgent from "../agents/test-script-review-agent";

// Check the dimensions of the viewport and reset them to the default values if they are not the default values.
const defaultWidth = parseInt(process.env.DISPLAY_WIDTH || "1024", 10);
const defaultHeight = parseInt(process.env.DISPLAY_HEIGHT || "768", 10);

export async function computerUseLoop(
  page: Page,
  response: any,
  testCaseReviewAgent: TestScriptReviewAgent,
  socket: Socket,
  switchedToNewTab: boolean = false // <-- Flag to ensure recursion happens only once for a new tab.
) {
  await page.screenshot({ path: "screenshot.png" });
  while (true) {
    // Check if the test case status is 'fail'.
    if (socket.data.testCaseStatus === "fail") {
      logger.debug("Test case failed. Exiting the computer use loop.");

      return response;
    }

    if (socket.data.testCaseStatus === "pass") {
      logger.debug("Test case passed. Exiting the computer use loop.");

      return response;
    }

    // Look for computer_call and function_call items in the model response.
    const computerCalls = response.output.filter(
      (item: any) => item.type === "computer_call"
    );
    const functionCalls = response.output.filter(
      (item: any) => item.type === "function_call"
    );

    // Handle function calls first (e.g., mark_done)
    if (functionCalls.length > 0) {
      for (const funcCall of functionCalls) {
        if (funcCall.name === "mark_done") {
          response = await sendFunctionCallOutput(
            funcCall.call_id,
            response.id,
            {
              status: "done",
            }
          );
          socket.emit("message", "\u2705 Test case finished.");
          socket.data.testCaseStatus = "pass";
          await page.context().browser()?.close();
          return response;
        }
      }
    }

    // Add the previous response id to the socket.data.
    socket.data.previousResponseId = response.id;

    if (computerCalls.length === 0) {
      logger.debug("No computer call found. Final output from model:");
      response.output.forEach((item: any) => {
        logger.debug(
          `Output from the model - ${JSON.stringify(item, null, 2)}`
        );
      });

      const messageResponse = response.output.filter(
        (item: any) => item.type === "message"
      );

      if (messageResponse.length > 0) {
        // Check if the response is a message.
        // NOTE: This is unused in this demo as we force the model to call tools with tool_choice = required
        // Update this logic to handle messages from the model if needed for your use case      if (messageResponse.length > 0) {
        logger.debug(
          "Response is a message. Trying to get answer from CUA Control Agent."
        );
        const message = messageResponse[0].content[0].text;

        logger.debug(`Message from the CUA model: ${message}`);

        if (!message.call_id) {
          logger.debug(
            `No call id found in the message. Exiting the computer use loop.`
          );
        }

        response = await sendInputToModel(
          {
            screenshotBase64: "",
            previousResponseId: response.id,
            lastCallId: message.call_id,
          },
          "continue"
        );
      } else {
        // If its not a computer_call, we just return the response.
        logger.debug(
          `Response for the model is neither a computer_call nor a message. Returning the response.`
        );
        return response;
      }
    } else {
      // We expect at most one computer_call per response.
      // Get reason from the response.
      const reasoningOutputs = response.output.filter(
        (item: any) => item.type === "reasoning"
      );
      if (reasoningOutputs.length > 0) {
        reasoningOutputs.forEach((reason: any) => {
          const summaryText = Array.isArray(reason.summary)
            ? reason.summary.map((s: any) => s.text).join(" ")
            : "No reasoning provided";
          socket.emit("message", `${summaryText}`);

          logger.debug(`Model reasoning: ${summaryText}`);
        });
      }

      // Get the first computer_call from the response.
      const computerCall = computerCalls[0];

      // Check for pending safety checks.
      if (
        computerCall.pending_safety_checks &&
        computerCall.pending_safety_checks.length > 0
      ) {
        const safetyCheck = computerCall.pending_safety_checks[0];
        logger.error(`Safety check detected: ${safetyCheck.message}`);
        socket.emit("message", `Safety check detected: ${safetyCheck.message}`);
        socket.emit(
          "message",
          "Test case failed. Exiting the computer use loop."
        );
        socket.data.testCaseStatus = "fail";
        return response;
      }

      // Continue with the existing logic.
      const lastCallId = (computerCall as any).call_id;
      socket.data.lastCallId = lastCallId;

      const action = (computerCall as any).action;

      // Take a screenshot of the page before the action is executed.
      if (["click"].includes(action?.type)) {
        const screenshotBuffer = await page.screenshot();
        const screenshotBase64 = screenshotBuffer.toString("base64");

        const testScriptReviewResponsePromise =
          testCaseReviewAgent.checkTestScriptStatus(screenshotBase64);
        // Asynchronously emit the test script review response to the socket.
        testScriptReviewResponsePromise
          .then((testScriptReviewResponse) => {
            socket.emit("testscriptupdate", testScriptReviewResponse);
          })
          .catch((error) => {
            logger.error(
              "Error during test script review: {error: " + error + "}"
            );
            socket.emit("testscriptupdate", {
              error: "Review processing failed.",
            });
          });
      }

      // Execute the action in the Playwright page.
      await handleModelAction(page, action);

      // Allow some time for UI changes to take effect.
      await page.waitForTimeout(1000);

      // Did this action open a new tab? If so, we need to start a new computer-use-loop with the new page context.
      // Retrieve all open pages in the current browser context.
      const pages = page.context().pages();
      if (pages.length > 1 && !switchedToNewTab) {
        // Assume the new tab is the last page.
        const newPage = pages[pages.length - 1];
        logger.debug(
          "New tab detected. Switching context to the new tab (recursion will happen only once)."
        );

        // Continue with your logic using newPage...
        const viewport = newPage.viewportSize();
        logger.trace(
          `Viewport dimensions of new page: ${viewport?.width}, ${viewport?.height}`
        );

        if (
          !viewport ||
          viewport.width !== defaultWidth ||
          viewport.height !== defaultHeight
        ) {
          logger.debug(
            `Resetting viewport size from (${viewport?.width || "undefined"}, ${
              viewport?.height || "undefined"
            }) to default (${defaultWidth}, ${defaultHeight}).`
          );
          await newPage.setViewportSize({
            width: defaultWidth,
            height: defaultHeight,
          });
        }

        // Take a new screenshot of the new page.
        const screenshotBuffer = await newPage.screenshot();
        const screenshotBase64 = screenshotBuffer.toString("base64");

        // Send the screenshot back as a computer_call_output.
        response = (await sendInputToModel({
          screenshotBase64,
          previousResponseId: response.id,
          lastCallId,
        })) as any;

        logger.info(
          "Recursively calling computerUseLoop with new page context."
        );
        logger.trace(`Response: ${JSON.stringify(response, null, 2)}`);

        // Recursively call the computerUseLoop with the new page.
        response = await computerUseLoop(
          newPage,
          response,
          testCaseReviewAgent,
          socket,
          true
        );

        return response;
      }
      let screenshotBuffer, screenshotBase64;

      logger.trace("Capturing updated screenshot...");

      screenshotBuffer = await getScreenshotWithRetry(page);
      screenshotBase64 = screenshotBuffer.toString("base64");

      // Send the screenshot back as a computer_call_output.
      response = (await sendInputToModel({
        screenshotBase64,
        previousResponseId: response.id,
        lastCallId,
      })) as any;
    }
  }
}

async function getScreenshotWithRetry(
  page: Page,
  retries = 3
): Promise<Buffer> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const screenshot = await page.screenshot();
      return screenshot;
    } catch (error) {
      logger.error(`Attempt ${attempt} - Error capturing screenshot: ${error}`);
      if (attempt === retries) {
        throw error;
      }
      await page.waitForTimeout(2000); // wait 2 seconds before retrying
    }
  }
  throw new Error("Failed to capture screenshot after retries");
}
