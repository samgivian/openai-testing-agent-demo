// lib/handlers/playwright-loop-handler.ts
import playwright, { Page } from "playwright";
const { chromium } = playwright;
import logger from "../utils/logger";
import { computerUseLoop } from "../lib/computer-use-loop";
import { Socket } from "socket.io";
import TestScriptReviewAgent from "../agents/test-script-review-agent";
import { setupCUAModel } from "../services/openai-cua-client";
import { LoginService } from "../services/login-service";
import { ModelInput } from "../services/openai-cua-client";
import { TestItem } from "../types/test-item";

// Read viewport dimensions from .env file with defaults if not set
const displayWidth: number = parseInt(process.env.DISPLAY_WIDTH || "1024", 10);
const displayHeight: number = parseInt(process.env.DISPLAY_HEIGHT || "768", 10);

async function executeTestItems(
  page: Page,
  testItems: TestItem[],
  baseUrl: string,
  socket: Socket
) {
  for (const item of testItems) {
    try {
      let locator;
      if (item.elementType) {
        if (item.text) {
          const selector =
            item.textMatch === "exact"
              ? `${item.elementType}:text-is("${item.text}")`
              : `${item.elementType}:has-text("${item.text}")`;
          locator = page.locator(selector);
        } else {
          locator = page.locator(item.elementType);
        }
      } else if (item.text) {
        // Allow callers to specify whether to look for an exact text match or
        // just check if the element contains the given text. Default behavior
        // is a substring match.
        const exact = item.textMatch === "exact";
        locator = page.getByText(item.text, { exact });
      } else if (item.inputLabel) {
        locator = page.getByLabel(item.inputLabel);
      } else if (item.testId) {
        locator = page.getByTestId(item.testId);
      } else if (item.url) {
        locator = page.locator(`a[href="${item.url}"]`);
      } else {
        continue;
      }

      if ((await locator.count()) === 0) {
        socket.emit(
          "message",
          `Element not found for ${
            item.url || item.text || item.inputLabel || item.testId
          }`
        );
        continue;
      }

      if (item.inputValue && (item.inputLabel || item.testId)) {
        await locator.first().fill(item.inputValue);
        socket.emit(
          "message",
          `Filled ${item.inputLabel || item.testId} with ${item.inputValue}`
        );
      }

      if (item.shouldClick) {
        await locator.first().click();
        socket.emit(
          "message",
          `Clicked ${item.text || item.url || item.inputLabel || item.testId}`
        );
      }

      if (item.checkNavigation && item.navigationUrl) {
        try {
          await page.waitForURL(item.navigationUrl, { timeout: 5000 });
          socket.emit(
            "message",
            `Navigated to ${item.navigationUrl}`
          );
        } catch {
          socket.emit(
            "message",
            `Navigation to ${item.navigationUrl} failed`
          );
        }

        await page.goto(baseUrl);
      }
    } catch (err) {
      socket.emit(
        "message",
        `Error executing test item ${item.url}: ${err}`
      );
      try {
        await page.goto(baseUrl);
      } catch {}
    }
  }
}

export async function cuaLoopHandler(
  systemPrompt: string,
  url: string,
  socket: Socket,
  testCaseReviewAgent: TestScriptReviewAgent,
  username: string,
  password: string,
  loginRequired: boolean,
  userInfo?: string
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
    const screenshot_before_login = await page.screenshot();
    const screenshot_before_login_base64 =
      screenshot_before_login.toString("base64");

    // Asynchronously check the status of the test script.
    const testScriptReviewResponsePromise =
      testCaseReviewAgent.checkTestScriptStatus(screenshot_before_login_base64);

    // Asynchronously emit the test script review response to the socket.
    testScriptReviewResponsePromise.then((testScriptReviewResponse) => {
      logger.debug(
        "Sending screenshot before login to Test Script Review Agent"
      );
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

    let modelInput: ModelInput;

    if (loginRequired) {
      // Note to the developer: Different applications will need their own login handlers.
      logger.debug("Login required... proceeding with login.");
      socket.emit("message", "Login required... proceeding with login.");

      const loginService = new LoginService();
      await loginService.fillin_login_credentials(username, password, page);

      logger.trace(
        "Login execution completed... proceeding with test script execution."
      );

      // wait for 5 seconds
      await page.waitForTimeout(5000);

      const screenshot_after_login = await page.screenshot();
      const screenshot_after_login_base64 =
        screenshot_after_login.toString("base64");

      // Asynchronously check the status of the test script.
      const testScriptReviewResponsePromise_after_login =
        testCaseReviewAgent.checkTestScriptStatus(
          screenshot_after_login_base64
        );

      // Asynchronously emit the test script review response to the socket.
      testScriptReviewResponsePromise_after_login.then(
        (testScriptReviewResponse) => {
          logger.debug(
            "Sending screenshot after login to Test Script Review Agent"
          );
          // Emit the test script review response to the socket.
          socket.emit("testscriptupdate", testScriptReviewResponse);
          logger.trace(
            `Test script state emitted after login: ${JSON.stringify(
              testScriptReviewResponse,
              null,
              2
            )}`
          );
        }
      );

      await loginService.click_login_button(page);

      socket.emit(
        "message",
        "Login step executed... proceeding with test script execution."
      );

      modelInput = {
        screenshotBase64: screenshot_after_login_base64,
        previousResponseId: undefined,
        lastCallId: undefined,
      };
    } else {
      // If login is not required, use the screenshot before login.
      modelInput = {
        screenshotBase64: screenshot_before_login_base64,
        previousResponseId: undefined,
        lastCallId: undefined,
      };
    }

    await executeTestItems(
      page,
      socket.data.testItems || [],
      url,
      socket
    );

    // Start with an initial call (without a screenshot or call_id)
    const userInfoStr = userInfo ?? "";
    let initial_response = await setupCUAModel(systemPrompt, userInfoStr);

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
