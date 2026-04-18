import { test, expect } from '@playwright/test'
import { setupTestDatabase } from '../fixtures/db.js'
import { generateTestEmail, generateTestName, getTomorrow, getNextWeekday, createDateAtHour, toISODateTime } from '../fixtures/test-data.js'

/**
 * Happy Path E2E Test
 * Complete booking flow: User books a slot and verifies it appears in admin dashboard
 */
test.describe('Happy Path - Complete Booking Flow', () => {
  // Setup database before all tests
  test.beforeAll(async () => {
    await setupTestDatabase()
  })

  test('User completes full booking flow and admin sees it', async ({ page, request }) => {
    // Test data
    const guestName = generateTestName('HappyPath')
    const guestEmail = generateTestEmail('happypath')
    let eventTypeTitle = ''
    let selectedTime = ''
    let selectedDate: Date

    await test.step('1. Navigate from home to booking page', async () => {
      await page.goto('/')
      await expect(page.locator('body')).toBeVisible()

      // Click the CTA button to go to booking
      await page.locator('.cta-button').click()

      // Wait for navigation to booking page
      await expect(page).toHaveURL(/.*booking/)
      await expect(page.locator('.event-type-selection')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('h1')).toContainText('Выберите тип события')
    })

    await test.step('2. Select event type', async () => {
      // Wait for event types to load
      const firstCard = page.locator('.event-type-card').first()
      await expect(firstCard).toBeVisible({ timeout: 10000 })

      // Store the event type title
      eventTypeTitle = await firstCard.locator('.title').textContent() || ''
      expect(eventTypeTitle).toBeTruthy()

      // Click on the first event type card
      await firstCard.click()

      // Verify we're now on the slot picker step
      await expect(page.locator('.slot-picker')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('.page-title')).toContainText(eventTypeTitle)
    })

    await test.step('3. Select date with available slots', async () => {
      // Wait for calendar to be ready
      await expect(page.locator('.calendar-legend')).toBeVisible({ timeout: 10000 })

      selectedDate = getNextWeekday(new Date()) // Get next weekday for booking

      // Navigate to the correct month in calendar if needed
      const currentMonth = new Date().getMonth()
      const targetMonth = selectedDate.getMonth()
      const monthDiff = targetMonth - currentMonth

      if (monthDiff > 0) {
        for (let i = 0; i < monthDiff; i++) {
          await page.locator('.p-datepicker-next').click()
          await page.waitForTimeout(500)
        }
      }

      // Select the date in the calendar
      const dayOfMonth = selectedDate.getDate()
      const dateCell = page.locator('.p-datepicker-calendar td span', {
        hasText: String(dayOfMonth)
      }).first()

      await dateCell.click()

      // Wait for slots panel
      await expect(page.locator('.time-slots-panel')).toBeVisible({ timeout: 10000 })
    })

    await test.step('4. Select time slot and continue', async () => {
      // Wait for slots to load
      await page.waitForTimeout(2000)

      const firstSlot = page.locator('.slot-item').first()
      await expect(firstSlot).toBeVisible({ timeout: 10000 })

      // Store the selected time
      selectedTime = await firstSlot.locator('.slot-time').textContent() || ''
      expect(selectedTime).toBeTruthy()

      // Click on the slot to select it
      await firstSlot.click()

      // Verify slot is selected
      await expect(firstSlot).toHaveClass(/selected/)

      // Click continue button
      await page.locator('.continue-btn').click()

      // Verify guest form dialog appears
      await expect(page.locator('.guest-dialog')).toBeVisible({ timeout: 10000 })
    })

    await test.step('5. Fill guest form and create booking', async () => {
      // Fill in the form
      await page.locator('#name').fill(guestName)
      await page.locator('#email').fill(guestEmail)

      // Click the book button
      await page.locator('button:has-text("Записаться")').click()

      // Wait for success screen
      await expect(page.locator('.booking-success')).toBeVisible({ timeout: 15000 })
      await expect(page.locator('.success-title')).toContainText('Запись создана')

      // Verify booking details
      await expect(page.locator('.event-title')).toContainText(eventTypeTitle)
      await expect(page.locator('.info-blocks')).toContainText(guestName)
      await expect(page.locator('.info-blocks')).toContainText(guestEmail)
    })

    await test.step('6. Admin sees booking in calendar', async () => {
      // Navigate to admin dashboard
      await page.goto('/admin')
      await expect(page.locator('.admin-view')).toBeVisible({ timeout: 10000 })

      // Verify calendar is visible with legend
      await expect(page.locator('.admin-calendar-container')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('.calendar-legend')).toContainText('Есть бронирования')

      // Navigate to correct month if needed
      const currentMonth = new Date().getMonth()
      const bookingMonth = selectedDate.getMonth()
      const monthDiff = bookingMonth - currentMonth

      if (monthDiff > 0) {
        for (let i = 0; i < monthDiff; i++) {
          await page.locator('.p-datepicker-next').click()
          await page.waitForTimeout(500)
        }
      }

      // Click on the booking date
      const dayOfMonth = selectedDate.getDate()
      await page.locator('.p-datepicker-calendar td span', {
        hasText: String(dayOfMonth)
      }).first().click()

      await page.waitForTimeout(1000)
    })

    await test.step('7. Admin verifies booking details in table', async () => {
      // Verify bookings table is visible
      await expect(page.locator('.booking-table-container')).toBeVisible({ timeout: 10000 })

      // Verify table title
      const tableTitle = await page.locator('.table-title').textContent()
      expect(tableTitle).toContain('Бронирования')

      // Verify all booking details in table
      const table = page.locator('.booking-table-container')
      await expect(table).toContainText(guestName)
      await expect(table).toContainText(guestEmail)
      await expect(table).toContainText(eventTypeTitle)

      // Verify time is shown
      await expect(table).toContainText(selectedTime.split(' - ')[0])

      // Verify status tag is present
      const statusTag = table.locator('.p-tag').first()
      await expect(statusTag).toBeVisible()

      console.log('✅ Happy Path test completed successfully!')
      console.log(`   Guest: ${guestName} (${guestEmail})`)
      console.log(`   Event: ${eventTypeTitle}`)
      console.log(`   Date: ${selectedDate.toDateString()}, Time: ${selectedTime}`)
    })
  })

  test('Admin sees booking created via API', async ({ page, request }) => {
    // Create booking via API
    let bookingDate = getNextWeekday(new Date()) // Get next weekday for booking

    const guestName = generateTestName('API')
    const guestEmail = generateTestEmail('api')

    // Get event types
    const eventTypesResponse = await request.get('/api/event-types')
    expect(eventTypesResponse.ok()).toBeTruthy()
    const eventTypesData = await eventTypesResponse.json() as { eventTypes: Array<{ id: string; title: string; durationMinutes: number }> }
    expect(eventTypesData.eventTypes.length).toBeGreaterThan(0)

    const eventType = eventTypesData.eventTypes[0]

    // Get available slots - request for working hours (9 AM - 5 PM)
    const dateFrom = toISODateTime(createDateAtHour(bookingDate, 9))
    const dateTo = toISODateTime(createDateAtHour(bookingDate, 17))

    const slotsResponse = await request.get(
      `/api/event-types/${eventType.id}/available-slots?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`
    )
    expect(slotsResponse.ok()).toBeTruthy()
    const slotsData = await slotsResponse.json() as { slots: Array<{ startTime: string; endTime: string }> }

    // If we have slots, create a booking
    if (slotsData.slots && slotsData.slots.length > 0) {
      const slot = slotsData.slots[0]
      bookingDate = new Date(slot.startTime)

      // Create booking via API
      const bookingResponse = await request.post('/api/bookings', {
        data: {
          eventTypeId: eventType.id,
          startTime: slot.startTime,
          guest: {
            name: guestName,
            email: guestEmail,
          },
        },
      })
      expect(bookingResponse.ok()).toBeTruthy()
      expect(bookingResponse.status()).toBe(201)

      // Navigate to admin and verify
      await page.goto('/admin')
      await expect(page.locator('.admin-view')).toBeVisible({ timeout: 10000 })

      // Navigate to correct month
      const currentMonth = new Date().getMonth()
      const bookingMonth = bookingDate.getMonth()
      const monthDiff = bookingMonth - currentMonth

      if (monthDiff > 0) {
        for (let i = 0; i < monthDiff; i++) {
          await page.locator('.p-datepicker-next').click()
          await page.waitForTimeout(500)
        }
      }

      // Click on the booking date
      const dayOfMonth = bookingDate.getDate()
      await page.locator('.p-datepicker-calendar td span', {
        hasText: String(dayOfMonth)
      }).first().click()

      await page.waitForTimeout(2000)

      // Verify table shows the booking
      await expect(page.locator('.booking-table-container')).toBeVisible({ timeout: 10000 })

      const table = page.locator('.booking-table-container')
      await expect(table).toContainText(guestName)
      await expect(table).toContainText(guestEmail)
      await expect(table).toContainText(eventType.title)

      // Verify calendar legend
      await expect(page.locator('.calendar-legend')).toContainText('Есть бронирования')

      console.log('✅ Admin API verification test completed!')
      console.log(`   Guest: ${guestName} (${guestEmail})`)
      console.log(`   Event: ${eventType.title}`)
    } else {
      console.log('⚠️ No slots available for API test - skipping booking creation')
      test.skip()
    }
  })
})
