import Link from 'next/link'

interface AuthFooterProps {
  text: string
  href: string
  linkText: string
}

export function AuthFooter({ text, href, linkText }: AuthFooterProps) {
  return (
    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
      {text}{' '}
      <Link
        href={href}
        className="font-semibold text-orange-600 transition-colors hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
      >
        {linkText}
      </Link>
    </p>
  )
}
