/**
 * HTTP API client - simple fetch wrapper
 */

import type { ErrorResponse } from './types'

const API_BASE_URL = '/api'

export interface ApiClientConfig {
  baseUrl?: string
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | undefined>
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: ErrorResponse
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options

  // Build URL with query params
  let fullUrl = url
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value)
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      fullUrl += `?${queryString}`
    }
  }

  const response = await fetch(fullUrl, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers
    }
  })

  if (!response.ok) {
    let errorData: ErrorResponse | undefined
    try {
      errorData = await response.json()
    } catch {
      // Ignore JSON parse error
    }

    const message = errorData?.message || `HTTP ${response.status}`
    throw new ApiError(message, response.status, errorData)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

// Factory function to create API client for a specific base path
export function createApiClient(basePath: string) {
  const prefix = `${API_BASE_URL}${basePath}`

  return {
    get<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>(`${prefix}${path}`, { ...options, method: 'GET' })
    },

    post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
      return request<T>(`${prefix}${path}`, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body)
      })
    },

    put<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
      return request<T>(`${prefix}${path}`, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body)
      })
    },

    delete<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>(`${prefix}${path}`, { ...options, method: 'DELETE' })
    }
  }
}

// Default client for root API
export const apiClient = createApiClient('')
