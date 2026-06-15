import useSWR, { SWRConfiguration } from 'swr'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useRef } from 'react'

interface OrderStatusData {
  orderStatus: string
  paymentStatus: string
  paymentMethod: string
  mpesaReceiptNumber?: string
}

interface UseOrderStatusReturn {
  data: OrderStatusData | null
  error: any
  isLoading: boolean
  isValidating: boolean
}

/**
 * Hook to poll order status every 3 seconds while payment is pending.
 * Stops polling after 5 minutes or when payment status becomes 'paid' or 'failed'.
 * @param orderId - The order ID to poll
 */
export function useOrderStatus(orderId: string | null | undefined): UseOrderStatusReturn {
  const { user } = useAuth()
  const startTimeRef = useRef<number>(0)

  // If no orderId or no user, return idle state
  if (!orderId || !user) {
    return {
      data: null,
      error: null,
      isLoading: false,
      isValidating: false,
    }
  }

  // Set start time on first render
  useEffect(() => {
    startTimeRef.current = Date.now()
  }, [orderId, user])

  const fetcher = async (): Promise<OrderStatusData> => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      credentials: 'include',
    })
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error?.message || 'Failed to fetch order status')
    }
    const data = await res.json()
    if (!data.success) throw new Error(data.error?.message || 'Failed to fetch order status')
    return data.data
  }

  const { data: swrData, error, isLoading, mutate, isValidating } = useSWR<OrderStatusData>(
    ['/api/orders/${orderId}/status', orderId],
    fetcher,
    {
      // We will handle polling manually, so disable SWR's polling
      refreshInterval: 0,
    }
  )

  const data = swrData ?? null

  // Set up manual polling interval
  useEffect(() => {
    if (!data) {
      // While loading, we still want to poll every 3 seconds
      const intervalId = setInterval(() => {
        mutate()
      }, 3000)
      return () => clearInterval(intervalId)
    }

    const { paymentStatus } = data
    if (paymentStatus === 'paid' || paymentStatus === 'failed') {
      // Stop polling when paid or failed
      return
    }

    // Check if 5 minutes have passed
    const elapsed = (Date.now() - startTimeRef.current) / 1000
    if (elapsed >= 300) {
      // Stop after 5 minutes
      return
    }

    // Otherwise, set interval to poll every 3 seconds
    const intervalId = setInterval(() => {
      mutate()
    }, 3000)
    return () => clearInterval(intervalId)
  }, [data, error, mutate, startTimeRef])

  return {
    data,
    error,
    isLoading,
    isValidating,
  }
}