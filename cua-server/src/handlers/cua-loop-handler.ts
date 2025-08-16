// lib/handlers/playwright-loop-handler.ts
import playwright from "playwright";
const { chromium } = playwright;
import logger from "../utils/logger";
import { computerUseLoop } from "../lib/computer-use-loop";
import { Socket } from "socket.io";
import TestScriptReviewAgent from "../agents/test-script-review-agent";
import { setupCUAModel } from "../services/openai-cua-client";

// Read viewport dimensions from .env file with defaults if not set
const displayWidth: number = parseInt(process.env.DISPLAY_WIDTH || "1024", 10);
const displayHeight: number = parseInt(process.env.DISPLAY_HEIGHT || "768", 10);

export async function cuaLoopHandler(
  systemPrompt: string,
  url: string,
  socket: Socket,
  testCaseReviewAgent: TestScriptReviewAgent
) {
  logger.info("Starting test script execution...");
  socket.emit("message", "Starting test script execution...");

  try {
    const browser = await chromium.launch({
      headless: false,
      env: {},
      args: ["--disable-extensions", "--disable-file-system"],
    });

    logger.debug("Creating new browser instance...");

    socket.emit("message", "Launching browser...");

    const page = await browser.newPage();

    // Set the page as data in the socket.
    socket.data.page = page;

    // Set viewport dimensions using env values
    await page.setViewportSize({ width: displayWidth, height: displayHeight });

    // Navigate to the provided URL from the form.
    await page.goto(url);

    // wait for 2 seconds
    await page.waitForTimeout(2000);

    // Capture an initial screenshot.
    const screenshotBuffer = await page.screenshot();
    const screenshotBase64 = screenshotBuffer.toString("base64");

    // Asynchronously check the status of the test script.
    const testScriptReviewResponsePromise =
      testCaseReviewAgent.checkTestScriptStatus(screenshotBase64);

    // Asynchronously emit the test script review response to the socket.
    testScriptReviewResponsePromise.then((testScriptReviewResponse) => {
      logger.debug("Sending initial screenshot to Test Script Review Agent");
      socket.emit("testscriptupdate", testScriptReviewResponse);
      logger.trace(
        `Initial test script state emitted: ${JSON.stringify(
          testScriptReviewResponse,
          null,
          2
        )}`
      );
    });

    // Await till network is idle.
    await page.waitForTimeout(2000);
    // Start with an initial call (without a screenshot or call_id)
    let initial_response = await setupCUAModel(systemPrompt);

    logger.debug(
      `Initial response from CUA model: ${JSON.stringify(
        initial_response,
        null,
        2
      )}`
    );
    logger.debug(`Starting computer use loop...`);

    const response = await computerUseLoop(
      page,
      initial_response,
      testCaseReviewAgent,
      socket
    );

    const messageResponse = response.output.filter(
      (item: any) => item.type === "message"
    );

    if (messageResponse.length > 0) {
      messageResponse.forEach((message: any) => {
        if (Array.isArray(message.content)) {
          message.content.forEach((contentBlock: any) => {
            if (contentBlock.type === "output_text" && contentBlock.text) {
              socket.emit("message", contentBlock.text);
            }
          });
        }
      });
    }
  } catch (error) {
    logger.error(`Error during playwright loop: ${error}`);
  }
}
