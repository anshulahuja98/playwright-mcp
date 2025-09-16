/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { z } = require('playwright/lib/mcp/sdk/bundle');

// Define tools following the pattern from existing tools
function defineTabTool(tool) {
  return {
    ...tool,
    handle: async (context, params, response) => {
      const tab = context.currentTabOrDie();
      const modalStates = tab.modalStates().map((state) => state.type);
      if (tool.clearsModalState && !modalStates.includes(tool.clearsModalState))
        response.addError(`Error: The tool "${tool.schema.name}" can only be used when there is related modal state present.
` + tab.modalStatesMarkdown().join("\n"));
      else if (!tool.clearsModalState && modalStates.length)
        response.addError(`Error: Tool "${tool.schema.name}" does not handle the modal state.
` + tab.modalStatesMarkdown().join("\n"));
      else
        return tool.handle(tab, params, response);
    }
  };
}

// Scroll tools implementation
const scrollPage = defineTabTool({
  capability: "core",
  schema: {
    name: "browser_scroll",
    title: "Scroll page",
    description: "Scroll the page in a specified direction",
    inputSchema: z.object({
      direction: z.enum(["up", "down", "left", "right"]).describe("Direction to scroll"),
      amount: z.number().optional().describe("Amount to scroll in pixels (default: 500)")
    }),
    type: "destructive"
  },
  handle: async (tab, params, response) => {
    response.setIncludeSnapshot();
    const amount = params.amount || 500;
    let deltaX = 0;
    let deltaY = 0;
    
    switch (params.direction) {
      case "up":
        deltaY = -amount;
        break;
      case "down":
        deltaY = amount;
        break;
      case "left":
        deltaX = -amount;
        break;
      case "right":
        deltaX = amount;
        break;
    }
    
    response.addCode(`// Scroll ${params.direction} by ${amount} pixels`);
    response.addCode(`await page.mouse.wheel(${deltaX}, ${deltaY});`);
    
    await tab.waitForCompletion(async () => {
      await tab.page.mouse.wheel(deltaX, deltaY);
    });
  }
});

const scrollToElement = defineTabTool({
  capability: "core",
  schema: {
    name: "browser_scroll_to_element",
    title: "Scroll to element",
    description: "Scroll the page to bring an element into view",
    inputSchema: z.object({
      element: z.string().describe("Human-readable element description used to obtain permission to interact with the element"),
      ref: z.string().describe("Exact target element reference from the page snapshot")
    }),
    type: "destructive"
  },
  handle: async (tab, params, response) => {
    response.setIncludeSnapshot();
    const locator = await tab.refLocator(params);
    
    response.addCode(`// Scroll to element`);
    response.addCode(`await page.locator('${params.ref}').scrollIntoViewIfNeeded();`);
    
    await tab.waitForCompletion(async () => {
      await locator.scrollIntoViewIfNeeded();
    });
  }
});

const scrollToPosition = defineTabTool({
  capability: "core",
  schema: {
    name: "browser_scroll_to_position",
    title: "Scroll to position",
    description: "Scroll the page to a specific position",
    inputSchema: z.object({
      x: z.number().describe("Horizontal scroll position in pixels"),
      y: z.number().describe("Vertical scroll position in pixels")
    }),
    type: "destructive"
  },
  handle: async (tab, params, response) => {
    response.setIncludeSnapshot();
    
    response.addCode(`// Scroll to position (${params.x}, ${params.y})`);
    response.addCode(`await page.evaluate(() => window.scrollTo(${params.x}, ${params.y}));`);
    
    await tab.waitForCompletion(async () => {
      await tab.page.evaluate((x, y) => window.scrollTo(x, y), params.x, params.y);
    });
  }
});

module.exports = [
  scrollPage,
  scrollToElement,
  scrollToPosition
];