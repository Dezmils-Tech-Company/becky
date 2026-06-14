import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'default',
  disabled = false,
  className = '',
  type = 'button',
  onClick,
}: ButtonProps) => {
  const baseClasses = 'transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variantClasses = {
    primary: 'bg-primary-600 text-primary-foreground hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-600 text-secondary-foreground hover:bg-secondary-700 focus:ring-secondary-500',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground focus:ring-primary-500',
  }

  const sizeClasses = {
    default: 'h-10 py-2 px-4 rounded-md text-sm font-medium',
    sm: 'h-9 px-3 rounded-md text-xs font-medium',
    lg: 'h-11 px-8 rounded-md text-lg font-medium',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  )
}