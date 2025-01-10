import { cn } from '@/lib/utils'

import { FC } from 'react'
import styles from './button.module.scss'

interface ButtonHeaderProps {
  children: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
  onClick?: () => void // Agregado
}

const ButtonHeader: FC<ButtonHeaderProps> = ({
  children,
  size = 'medium',
  variant = 'primary',
  className,
  onClick,
}) => {
  const buttonClasses = cn(
    styles.button,
    styles[size],
    styles[variant],
    className,
  )

  return (
    <button
      className={cn(
        buttonClasses,
        'mt-10 w-full h-12 px-8 py-2 rounded-sm bg-primary  text-primary-foreground focus:outline-none',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default ButtonHeader
