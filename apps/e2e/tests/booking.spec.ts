import { test, expect } from '@playwright/test'
import { setupTestDatabase, createBooking } from '../fixtures/db.js'
import { generateTestEmail, generateTestName, getTomorrow, getNextWeekday, formatDateISO, toISODateTime, createDateAtHour } from '../fixtures/test-data.js'

/**
 * Extended smoke tests with database setup
 * Tests the complete booking flow end-to-end
 */
test.describe('Booking Flow', () => {
  // Setup database once for all tests in this file
  test.beforeAll(async () => {
    await setupTestDatabase()
  })

  test('user can navigate through booking page', async ({ page }) => {
    // Step 1: Navigate to booking page
    await page.goto('/booking')
    await expect(page.locator('body')).toBeVisible()

    // Wait for event types to load (Vue mounting + API call)
    await page.waitForTimeout(3000)

    // Step 2: Check that event types are displayed
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toBeTruthy()
    expect(bodyText?.length).toBeGreaterThan(100) // Should have content

    // Try to find event type cards
    const eventTypeCard = page.locator('.event-type-card, [data-testid="event-type-card"], .p-card').first()
    const hasEventTypes = await eventTypeCard.isVisible().catch(() => false)

    if (hasEventTypes) {
      // Click first event type to proceed to slot picker
      await eventTypeCard.click()

      // Wait for slot picker
      await page.waitForTimeout(2000)

      // Check if slot picker is visible
      const slotPicker = page.locator('.slot-picker, [data-testid="slot-picker"], .calendar-container').first()
      await expect(slotPicker).toBeVisible({ timeout: 10000 })
    }
  })

  test('booking page loads with content', async ({ page }) => {
    await page.goto('/booking')

    // Check page loaded
    await expect(page.locator('body')).toBeVisible()

    // Wait for content to load
    await page.waitForTimeout(3000)

    // Should have some content
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toBeTruthy()
    expect(bodyText?.length).toBeGreaterThan(50)
  })

  test('API returns available slots', async ({ request }) => {
    // First get event types
    const eventTypesResponse = await request.get('/api/event-types')
    expect(eventTypesResponse.ok()).toBeTruthy()

    const eventTypesData = await eventTypesResponse.json() as { eventTypes: Array<{ id: string; title: string }> }
    expect(eventTypesData.eventTypes.length).toBeGreaterThan(0)

    // Get tomorrow's date for a weekday
    const nextWeekday = getNextWeekday(new Date()) // Monday = 1
    const dateFrom = toISODateTime(createDateAtHour(nextWeekday, 9))
    const dateTo = toISODateTime(createDateAtHour(nextWeekday, 17))

    // Request available slots for the first event type using correct endpoint
    const eventTypeId = eventTypesData.eventTypes[0].id
    const slotsResponse = await request.get(
      `/api/event-types/${eventTypeId}/available-slots?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`
    )
    expect(slotsResponse.ok()).toBeTruthy()

    const slotsData = await slotsResponse.json() as { slots: unknown[] }
    // API returns { slots: [...] }
    expect(slotsData).toHaveProperty('slots')
    expect(Array.isArray(slotsData.slots)).toBeTruthy()
  })

  test('API allows creating a booking', async ({ request }) => {
    // Get event types
    const eventTypesResponse = await request.get('/api/event-types')
    expect(eventTypesResponse.ok()).toBeTruthy()

    const eventTypesData = await eventTypesResponse.json() as { eventTypes: Array<{ id: string; durationMinutes: number }> }
    expect(eventTypesData.eventTypes.length).toBeGreaterThan(0)

    const eventType = eventTypesData.eventTypes[0]

    // Get available slots
    const nextWeekday = getNextWeekday(new Date())
    const dateFrom = toISODateTime(createDateAtHour(nextWeekday, 9))
    const dateTo = toISODateTime(createDateAtHour(nextWeekday, 17))

    const slotsResponse = await request.get(
      `/api/event-types/${eventType.id}/available-slots?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`
    )
    expect(slotsResponse.ok()).toBeTruthy()

    const slotsData = await slotsResponse.json() as { slots: Array<{ startTime: string; endTime: string }> }

    // If we have slots, try to create a booking
    if (slotsData.slots && slotsData.slots.length > 0) {
      const slot = slotsData.slots[0]

      const bookingResponse = await request.post('/api/bookings', {
        data: {
          eventTypeId: eventType.id,
          startTime: slot.startTime,
          guest: {
            name: generateTestName(),
            email: generateTestEmail(),
          },
        },
      })

      expect(bookingResponse.ok()).toBeTruthy()
      expect(bookingResponse.status()).toBe(201)

      const bookingData = await bookingResponse.json() as { id: string; startTime: string }
      expect(bookingData).toHaveProperty('id')
      expect(bookingData).toHaveProperty('startTime')
    } else {
      // No slots available, just log it
      console.log('Test has not been executed: No slots available for booking creation test')
    }
  })
})
