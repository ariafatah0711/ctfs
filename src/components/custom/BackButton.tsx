// components/custom/BackButton.tsx
"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Props = {
  href?: string // optional: if you want to force redirect to a specific path
  label?: string
  onClick?: () => void
  className?: string
}

export default function BackButton({ href, label = "Back", onClick, className = '' }: Props) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }

    if (href) router.push(href)
    else router.back()
  }

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      className={`flex items-center gap-2 text-gray-700 dark:text-gray-200 ${className}`}
    >
      ← {label}
    </Button>
  )
}
