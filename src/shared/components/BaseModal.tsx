"use client"

import * as React from "react"
import { cn } from "@/shared/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui"

const MODAL_SIZE_CLASS = {
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
} as const

const BASE_MODAL_CONTENT_CLASS =
  "w-[calc(100vw-32px)] sm:w-full h-[88vh] max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/70 p-0 text-gray-900 shadow-2xl backdrop-blur-xl dark:border-gray-800 dark:bg-[#0a0d14]/80 dark:text-gray-100 [&_button.absolute.right-4.top-4]:block md:[&_button.absolute.right-4.top-4]:hidden [&_button.absolute.right-4.top-4]:text-gray-500 dark:[&_button.absolute.right-4.top-4]:text-gray-400"

export type ModalSize = keyof typeof MODAL_SIZE_CLASS

type BaseModalProps = React.ComponentPropsWithoutRef<typeof Dialog> & {
  children: React.ReactNode
  trigger?: React.ReactElement
  size?: ModalSize
  contentClassName?: string
}

export function BaseModal({
  children,
  trigger,
  size = "3xl",
  contentClassName,
  ...dialogProps
}: BaseModalProps) {
  return (
    <Dialog {...dialogProps}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        className={cn(
          BASE_MODAL_CONTENT_CLASS,
          MODAL_SIZE_CLASS[size],
          contentClassName
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

type ModalHeaderProps = {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function ModalHeader({
  title,
  description,
  actions,
  className,
  titleClassName,
  descriptionClassName,
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "shrink-0 border-b border-gray-200 bg-white/70 px-4 py-4 backdrop-blur md:px-6 dark:border-gray-800 dark:bg-gray-900/80",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <DialogTitle
            className={cn(
              "text-lg font-bold tracking-tight text-gray-900 dark:text-white md:text-xl",
              titleClassName
            )}
          >
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription
              className={cn(
                "mt-1 text-sm text-gray-500 dark:text-gray-400",
                descriptionClassName
              )}
            >
              {description}
            </DialogDescription>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  )
}

type ModalBodyProps = {
  children: React.ReactNode
  className?: string
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto px-4 py-5 md:px-6 scroll-hidden",
        className
      )}
    >
      {children}
    </div>
  )
}

type ModalFooterProps = {
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function ModalFooter({
  children,
  className,
  contentClassName,
}: ModalFooterProps) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-gray-200 bg-white/70 px-4 py-4 backdrop-blur md:px-6 dark:border-gray-800 dark:bg-gray-900/80",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}
