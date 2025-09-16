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

import { test, expect } from './fixtures';

test('browser_scroll', async ({ client, server }) => {
  // Navigate to a page first
  await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  });

  // Test scrolling down
  const scrollResult = await client.callTool({
    name: 'browser_scroll',
    arguments: { direction: 'down', amount: 300 },
  });

  expect(scrollResult).toHaveProperty('content');
  expect(scrollResult.content[0]).toHaveProperty('text');
  expect(scrollResult.content[0].text).toContain('Scroll down by 300 pixels');
  expect(scrollResult.content[0].text).toContain('await page.mouse.wheel(0, 300);');
});

test('browser_scroll_to_position', async ({ client, server }) => {
  // Navigate to a page first
  await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  });

  // Test scrolling to a specific position
  const scrollResult = await client.callTool({
    name: 'browser_scroll_to_position',
    arguments: { x: 0, y: 500 },
  });

  expect(scrollResult).toHaveProperty('content');
  expect(scrollResult.content[0]).toHaveProperty('text');
  expect(scrollResult.content[0].text).toContain('Scroll to position (0, 500)');
  expect(scrollResult.content[0].text).toContain('await page.evaluate(() => window.scrollTo(0, 500));');
});

test('browser_scroll with different directions', async ({ client, server }) => {
  // Navigate to a page first
  await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  });

  // Test scrolling up
  const scrollUpResult = await client.callTool({
    name: 'browser_scroll',
    arguments: { direction: 'up', amount: 100 },
  });

  expect(scrollUpResult.content[0].text).toContain('Scroll up by 100 pixels');
  expect(scrollUpResult.content[0].text).toContain('await page.mouse.wheel(0, -100);');

  // Test scrolling right
  const scrollRightResult = await client.callTool({
    name: 'browser_scroll',
    arguments: { direction: 'right', amount: 200 },
  });

  expect(scrollRightResult.content[0].text).toContain('Scroll right by 200 pixels');
  expect(scrollRightResult.content[0].text).toContain('await page.mouse.wheel(200, 0);');
});