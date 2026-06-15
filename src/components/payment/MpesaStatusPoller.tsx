import { useState } from 'react'
import { useOrderStatus } from '@/hooks/useOrderStatus'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface MpesaStatusPollerProps {
  orderId: string
}

export default function MpesaStatusPoller({ orderId }: MpesaStatusPollerProps) {
  const { data, error, isLoading, isValidating } = useOrderStatus(orderId)
  const router = useRouter()

  // Determine if polling is active (waiting for payment)
  const isPending = data?.paymentStatus === 'pending'
  const isPaid = data?.paymentStatus === 'paid'
  const isFailed = data?.paymentStatus === 'failed'
  const isDone = isPaid || isFailed

  // Handle retry via query (stub for now - will be implemented in Task 13)
  const handleRetryViaQuery = async () => {
    // In Task 13, we will implement the actual MPESA query API call
    // For now, we show a message that this is a stub
    alert('Retry via query: This will call the MPESA query API to check payment status with Safaricom (to be implemented in Task 13).')
    // We could also trigger a refetch by calling mutate from useOrderStatus, but we don't have access to it here.
    // We'll just show the alert for now.
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
        <p className="text-sm text-gray-600">Waiting for payment confirmation...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-600">Error checking payment status: {error.message}</p>
        <Button onClick={handleRetryViaQuery} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  if (isPaid) {
    return (
      <div className="text-center py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          ✓
        </div>
        <p className="mt-2 text-sm text-gray-600">Payment confirmed!</p>
      </div>
    )
  }

  if (isFailed) {
    return (
      <div className="text-center py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          ✗
        </div>
        <p className="mt-2 text-sm text-gray-600">Payment failed</p>
        <Button onClick={handleRetryViaQuery} variant="outline" size="sm">
          Try again
        </Button>
      </div>
    )
  }

  // Pending state
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      <p className="text-sm text-gray-600">Waiting for payment confirmation...</p>
      {!isValidating && (
        <Button onClick={handleRetryViaQuery} variant="outline" size="sm">
          Retry via query
        </Button>
      )}
    </div>
  )
}