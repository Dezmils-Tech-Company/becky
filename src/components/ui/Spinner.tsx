import type { ReactNode } from 'react'

interface SpinnerProps {
  className?: string
  size?: number
}

export const Spinner = ({ className = '', size = 24 }: SpinnerProps) => {
  return (
    <div className={`animate-spin h-${size} w-${size} ${className}`}>
      <svg
        className="opacity-25"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        ></path>
      </svg>
    </div>
  )
}