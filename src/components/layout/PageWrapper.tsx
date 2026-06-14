import { cn } from '../../lib/utils/cn'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

/**
 * Max-width container with consistent horizontal padding, used to wrap
 * page content for a centered, readable layout.
 */
export function PageWrapper({ children, className }: PageWrapperProps): React.ReactNode {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}