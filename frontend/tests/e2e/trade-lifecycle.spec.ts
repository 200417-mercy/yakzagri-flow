import { test, expect, type Page } from "@playwright/test";

/**
 * E2E coverage for the trade lifecycle, including offline trade creation
 * queueing and online replay (issue #276).
 *
 * The app persists queued trade actions in localStorage under
 * `trade-queue` while offline and replays them once connectivity returns.
 */

const TRADE_QUEUE_KEY = "trade-queue";

async function readQueue(page: Page): Promise<unknown[]> {
  const raw = await page.evaluate((key) => window.localStorage.getItem(key), TRADE_QUEUE_KEY);
  return raw ? (JSON.parse(raw) as unknown[]) : [];
}

async function submitTrade(page: Page, counterparty: string, amount: string) {
  await page.getByLabel(/counterparty/i).fill(counterparty);
  await page.getByLabel(/amount/i).fill(amount);
  await page.getByRole("button", { name: /create trade/i }).click();
}

test.describe("trade lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/trades");
    await page.evaluate((key) => window.localStorage.removeItem(key), TRADE_QUEUE_KEY);
    await page.reload();
  });

  test("queues a trade while offline and replays it when back online", async ({ page, context }) => {
    const counterparty = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
    const amount = "100";

    // Go offline and submit a trade action.
    await context.setOffline(true);
    await submitTrade(page, counterparty, amount);

    // The action should be queued locally rather than lost.
    await expect
      .poll(async () => (await readQueue(page)).length, { timeout: 5_000 })
      .toBe(1);

    const queued = await readQueue(page);
    expect(queued[0]).toMatchObject({ counterparty, amount });

    // Restore connectivity and assert the queued action is replayed.
    await context.setOffline(false);

    await expect
      .poll(async () => (await readQueue(page)).length, { timeout: 10_000 })
      .toBe(0);

    // The replayed trade should now be visible in the trade list.
    await expect(page.getByText(counterparty)).toBeVisible({ timeout: 10_000 });
  });

  test("does not queue a trade when online", async ({ page }) => {
    const counterparty = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

    await submitTrade(page, counterparty, "50");

    // Give the app a moment to settle, then confirm nothing was queued.
    await page.waitForTimeout(500);
    expect(await readQueue(page)).toHaveLength(0);
  });
});
