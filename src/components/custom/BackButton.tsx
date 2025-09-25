// components/custom/BackButton.tsx
"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Props = {
  href?: string // optional: kalau mau force redirect ke path tertentu
  label?: string
}

export default function BackButton({ href, label = "Back" }: Props) {
  const router = useRouter()

  const handleClick = () => {
    if (href) router.push(href)
    else router.back()
  }

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      className="flex items-center gap-2"
    >
      ← {label}
    </Button>
  )
}
