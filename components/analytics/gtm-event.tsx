'use client'

import { MouseEventHandler, ReactNode } from 'react'
import { event } from '@/lib/gtm'

interface GTMEventProps {
  action: string
  category: string
  label: string
  value?: string
  children: ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
}

export default function GTMEvent({
  action,
  category,
  label,
  value = '',
  children,
  className = '',
  onClick,
  ...rest
}: GTMEventProps) {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    // Push event to dataLayer
    event({
      action,
      category,
      label,
      value: value || '0',
    })

    // Call the original onClick if provided
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <button
      className={className}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  )
} 