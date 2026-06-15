import type { ChangeEvent, FocusEvent, ReactNode } from 'react'

export interface TextareaProps {
  id?: string
  name?: string
  value: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
  autoComplete?: string
  minLength?: number
  rows?: number
  icon?: ReactNode
}

export const Textarea = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder = '',
  className = '',
  disabled = false,
  required = false,
  autoComplete = 'off',
  minLength,
  rows = 4,
  icon
}: TextareaProps) => {
  const baseClasses = `
    flex h-10 w-full rounded-md border border-input bg-background px-3 py-2
    text-sm ring-offset-background file:border-0 file:bg-transparent
    file:text-sm file:font-medium placeholder:text-muted-foreground
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
    focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
  `

  return (
    <div className="flex items-center space-x-2">
      {id && <span className="sr-only">{id}</span>}
      {icon && <span className="h-5 w-5">{icon}</span>}
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`${baseClasses.trim()} ${className}`}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        rows={rows}
      />
    </div>
  )
}