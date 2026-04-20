import { expect, test } from "@playwright/test";
import { setupTestDatabase } from "../fixtures/db.js";
import {
  ADMIN_TZ,
  generateTestEmail,
  generateTestName,
  getNextDayWorkingInterval,
} from "../fixtures/test-data.js";

const CLIENT_TZ = "Asia/Yekaterinburg";

/**
 * Happy Path E2E Test
 * Single end-to-end flow with two roles and two timezones:
 * 1. Client books a slot in client timezone
 * 2. Admin verifies booking in admin timezone
 */

test.beforeAll(async () => {
  await setupTestDatabase();
});

test.describe("Happy Path - Client to Admin Cross-Timezone Flow", () => {
  test("Client creates booking and admin sees it in another timezone", async ({
    browser,
  }) => {
    const clientContext = await browser.newContext({
      timezoneId: CLIENT_TZ,
      locale: "ru-RU",
    });
    const adminContext = await browser.newContext({
      timezoneId: ADMIN_TZ,
      locale: "ru-RU",
    });

    const clientPage = await clientContext.newPage();
    const adminPage = await adminContext.newPage();

    // Shared data between client and admin verification steps.
    const guestName = generateTestName("HappyPath");
    const guestEmail = generateTestEmail("happypath");
    const targetDate = getNextDayWorkingInterval(
      new Date(),
      ADMIN_TZ,
      CLIENT_TZ,
    );

    let eventTypeTitle = "";

    try {
      await test.step("1. Client books a slot in client timezone", async () => {
        await clientPage.goto("/");
        await expect(clientPage.locator("body")).toBeVisible();

        await clientPage.locator(".cta-button").click();

        await expect(clientPage).toHaveURL(/.*booking/);
        await expect(clientPage.locator(".event-type-selection")).toBeVisible({
          timeout: 10000,
        });
        await expect(clientPage.locator("h1")).toContainText(
          "Выберите тип события",
        );

        const firstCard = clientPage.locator(".event-type-card").first();
        await expect(firstCard).toBeVisible({ timeout: 10000 });

        eventTypeTitle =
          (await firstCard.locator(".title").textContent())?.trim() || "";
        expect(eventTypeTitle).toBeTruthy();

        await firstCard.click();

        await expect(clientPage.locator(".slot-picker")).toBeVisible({
          timeout: 10000,
        });
        await expect(clientPage.locator(".page-title")).toContainText(
          eventTypeTitle,
        );

        await expect(clientPage.locator(".calendar-legend")).toBeVisible({
          timeout: 10000,
        });

        const currentMonth = Number(
          new Date().toLocaleString("en-US", { month: "numeric" }),
        );
        const targetMonth = targetDate.from.clientSide.month;
        const monthDiff = targetMonth - currentMonth;

        if (monthDiff > 0) {
          for (let i = 0; i < monthDiff; i++) {
            await clientPage.locator(".p-datepicker-next").click();
            await clientPage.waitForTimeout(500);
          }
        }

        const dayOfMonth = targetDate.from.clientSide.day;
        await clientPage
          .locator(".p-datepicker-calendar td span", {
            hasText: String(dayOfMonth),
          })
          .first()
          .click();

        await expect(clientPage.locator(".time-slots-panel")).toBeVisible({
          timeout: 10000,
        });

        await clientPage.waitForTimeout(2000);

        const firstSlot = clientPage.locator(".slot-item").first();
        await expect(firstSlot).toBeVisible({ timeout: 10000 });
        await firstSlot.click();
        await expect(firstSlot).toHaveClass(/selected/);

        await clientPage.locator(".continue-btn").click();

        await expect(clientPage.locator(".guest-dialog")).toBeVisible({
          timeout: 10000,
        });

        await clientPage.locator("#name").fill(guestName);
        await clientPage.locator("#email").fill(guestEmail);
        await clientPage.locator('button:has-text("Записаться")').click();

        await expect(clientPage.locator(".booking-success")).toBeVisible({
          timeout: 15000,
        });
        await expect(clientPage.locator(".success-title")).toContainText(
          "Запись создана",
        );

        await expect(clientPage.locator(".event-title")).toContainText(
          eventTypeTitle,
        );
        await expect(clientPage.locator(".info-blocks")).toContainText(
          guestName,
        );
        await expect(clientPage.locator(".info-blocks")).toContainText(
          guestEmail,
        );
      });

      await test.step("2. Admin sees created booking in admin timezone", async () => {
        await adminPage.goto("/admin");
        await expect(adminPage.locator(".admin-view")).toBeVisible({
          timeout: 10000,
        });

        await expect(
          adminPage.locator(".admin-calendar-container"),
        ).toBeVisible({ timeout: 10000 });
        await expect(adminPage.locator(".calendar-legend")).toContainText(
          "Есть бронирования",
        );

        const currentMonth = Number(
          new Date().toLocaleString("en-US", { month: "numeric" }),
        );
        const bookingMonth = targetDate.from.adminSide.month;
        const monthDiff = bookingMonth - currentMonth;

        if (monthDiff > 0) {
          for (let i = 0; i < monthDiff; i++) {
            await adminPage.locator(".p-datepicker-next").click();
            await adminPage.waitForTimeout(500);
          }
        }

        const dayOfMonth = targetDate.from.adminSide.day;
        await adminPage
          .locator(".p-datepicker-calendar td span", {
            hasText: String(dayOfMonth),
          })
          .first()
          .click();

        await adminPage.waitForTimeout(1000);

        await expect(adminPage.locator(".booking-table-container")).toBeVisible(
          {
            timeout: 10000,
          },
        );

        const tableTitle = await adminPage
          .locator(".table-title")
          .textContent();
        expect(tableTitle).toContain("Бронирования");

        const table = adminPage.locator(".booking-table-container");
        await expect(table).toContainText(guestName);
        await expect(table).toContainText(guestEmail);
        await expect(table).toContainText(eventTypeTitle);

        const statusTag = table.locator(".p-tag").first();
        await expect(statusTag).toBeVisible();
      });
    } finally {
      await clientContext.close();
      await adminContext.close();
    }
  });
});
