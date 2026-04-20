/**
 * Database fixtures for E2E tests
 *
 * Provides utilities for seeding test data before tests.
 * Uses HTTP endpoint to reset database inside Docker container.
 */

const API_BASE_URL = 'http://localhost:3001';

/**
 * Reset and seed database via HTTP endpoint
 * Calls POST /api/testing/reset in the api-e2e container
 */
export async function setupTestDatabase(): Promise<void> {
  console.log('🔄 Resetting database via HTTP...');

  try {
    const response = await fetch(`${API_BASE_URL}/api/testing/reset`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Database reset failed: ${response.status} ${errorText}`);
    }

    const result = (await response.json()) as { ok: boolean; created: Record<string, number> };
    console.log('✅ Database reset complete:', result.created);
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
}

/**
 * Create a test event type directly via API
 * Returns the created event type ID
 */
export async function createTestEventType(
  apiContext: { post: (url: string, data: unknown) => Promise<{ ok: () => boolean; json: () => Promise<unknown> }> },
  data: {
    title: string
    durationMinutes: number
    description?: string
  }
): Promise<string> {
  const response = await apiContext.post('/api/admin/event-types', {
    title: data.title,
    durationMinutes: data.durationMinutes,
    description: data.description,
  })

  if (!response.ok()) {
    throw new Error(`Failed to create event type: ${data.title}`)
  }

  const result = await response.json() as { id: string }
  return result.id
}

/**
 * Generate unique test data to avoid conflicts
 */
export function generateUniqueTestData(prefix: string): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `${prefix}_${timestamp}_${random}`
}

/**
 * Get available slots for a date via API
 * Endpoint: /api/event-types/{eventTypeId}/available-slots
 */
export async function getAvailableSlots(
  apiContext: { get: (url: string) => Promise<{ ok: () => boolean; json: () => Promise<unknown> }> },
  eventTypeId: string,
  dateFrom: string,
  dateTo: string
): Promise<Array<{ startTime: string; endTime: string }>> {
  const url = `/api/event-types/${eventTypeId}/available-slots?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`
  const response = await apiContext.get(url)

  if (!response.ok()) {
    throw new Error(`Failed to get available slots for event type: ${eventTypeId}`)
  }

  const result = await response.json() as { slots: Array<{ startTime: string; endTime: string }> }
  return result.slots || []
}

/**
 * Create a booking via API
 */
export async function createBooking(
  apiContext: { post: (url: string, data: unknown) => Promise<{ ok: () => boolean; json: () => Promise<unknown> }> },
  data: {
    eventTypeId: string
    startTime: string
    guestName: string
    guestEmail: string
  }
): Promise<{ id: string }> {
  const response = await apiContext.post('/api/bookings', {
    eventTypeId: data.eventTypeId,
    startTime: data.startTime,
    guestName: data.guestName,
    guestEmail: data.guestEmail,
  })

  if (!response.ok()) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Failed to create booking: ${JSON.stringify(error)}`)
  }

  return await response.json() as { id: string }
}
