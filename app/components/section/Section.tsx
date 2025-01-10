'use client'
import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'
//es importante definir un className en PropsWithChildren para que acepte las clases personalisadas en
//cuando vamos a utilizar este componente
export const Section = (props: PropsWithChildren<{ className?: string }>) => {
  return (
    <section className={cn(props.className, 'max-w-5xl m-auto')}>
      {props.children}
    </section>
  )
}
