'use client'

import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  messages: string[]
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ messages }) => {
  if (messages.length === 0) return null

  return (
    <div className={cn('p-4 border rounded-md shadow-md bg-red-100')}>
      {messages.map((message, index) => (
        <p key={index} className="text-red-700 text-sm">
          {message}
        </p>
      ))}
    </div>
  )
}

export default ErrorMessage
