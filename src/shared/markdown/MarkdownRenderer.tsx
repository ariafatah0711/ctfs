'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import Zoom from 'react-medium-image-zoom'
import { Copy, Check, ChevronsRight, ChevronsDown } from 'lucide-react'

interface MarkdownRendererProps {
  content: string
  className?: string
  onCommentsExtracted?: (comments: string[]) => void
  variant?: 'default' | 'compact'
}

function extractText(children: any): string {
  if (typeof children === 'string') {
    return children
  }
  if (Array.isArray(children)) {
    return children.map(extractText).join('')
  }
  if (React.isValidElement(children)) {
    return extractText((children as any).props?.children)
  }
  return ''
}

function CodeBlockWrapper({ children, isDark = true }: { children: React.ReactNode; isDark?: boolean }) {
  const [isWrapped, setIsWrapped] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)
  const preRef = React.useRef<HTMLPreElement>(null)

  React.useEffect(() => {
    if (preRef.current) {
      const hasScroll = preRef.current.scrollWidth > preRef.current.clientWidth
      setHasOverflow(hasScroll)
    }
  }, [])

  const childElement = React.isValidElement(children) ? (children as React.ReactElement<any>) : null
  const modifiedChild = childElement
    ? React.cloneElement(childElement, {
      ref: preRef,
      className: `${(childElement.props as any)?.className || ''} ${isWrapped ? 'whitespace-normal break-words' : 'whitespace-pre overflow-x-auto'
        }`.trim(),
    })
    : children

  const handleCopy = () => {
    const text = extractText((childElement as any)?.props?.children)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative mb-6">
      {hasOverflow && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button
            type="button"
            onClick={handleCopy}
            className={`p-1.5 rounded transition-colors ${isDark
              ? 'bg-gray-800 hover:bg-gray-700 text-orange-300'
              : 'bg-gray-200 hover:bg-gray-300 text-orange-600'
              }`}
            title={copied ? 'Copied!' : 'Copy'}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setIsWrapped(!isWrapped)}
            className={`p-1.5 rounded transition-colors ${isDark
              ? 'bg-gray-800 hover:bg-gray-700 text-orange-300'
              : 'bg-gray-200 hover:bg-gray-300 text-orange-600'
              }`}
            title={isWrapped ? 'Horizontal scroll' : 'Wrap text'}
          >
            {isWrapped ? <ChevronsRight size={16} /> : <ChevronsDown size={16} />}
          </button>
        </div>
      )}
      {modifiedChild}
    </div>
  )
}

function BlockquoteWrapper({ children, isDark = true }: { children: React.ReactNode; isDark?: boolean }) {
  const [isWrapped, setIsWrapped] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)
  const blockquoteRef = React.useRef<HTMLQuoteElement>(null)

  React.useEffect(() => {
    if (blockquoteRef.current) {
      const hasScroll = blockquoteRef.current.scrollWidth > blockquoteRef.current.clientWidth
      setHasOverflow(hasScroll)
    }
  }, [])

  const childElement = React.isValidElement(children) ? (children as React.ReactElement<any>) : null
  const modifiedChild = childElement
    ? React.cloneElement(childElement, {
      ref: blockquoteRef,
      className: `${(childElement.props as any)?.className || ''} ${isWrapped ? 'break-words whitespace-normal' : 'whitespace-nowrap overflow-x-auto'
        }`.trim(),
    })
    : children

  const handleCopy = () => {
    const text = extractText((childElement as any)?.props?.children)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative mb-6">
      {hasOverflow && (
        <div className="absolute -top-8 right-0 flex gap-1 z-10">
          <button
            type="button"
            onClick={() => setIsWrapped(!isWrapped)}
            className={`p-1.5 rounded transition-colors ${isDark
              ? 'bg-gray-800 hover:bg-gray-700 text-orange-300'
              : 'bg-orange-100 hover:bg-orange-200 text-orange-600'
              }`}
            title={isWrapped ? 'Horizontal scroll' : 'Wrap text'}
          >
            {isWrapped ? <ChevronsRight size={16} /> : <ChevronsDown size={16} />}
          </button>
        </div>
      )}
      {modifiedChild}
    </div>
  )
}

function parseCustomComments(content: string) {
  const commentLineRegex = /^\s*\$!\s+(.*)$/
  const lines = content.split('\n')
  const filteredLines: string[] = []
  const comments: string[] = []

  for (const line of lines) {
    const trimmedStart = line.trimStart()
    const match = trimmedStart.match(commentLineRegex)
    if (match) {
      comments.push(match[1].trim())
      continue
    }
    filteredLines.push(line)
  }

  return { filtered: filteredLines.join('\n'), comments }
}

function getMarkdownImageDimension(value: string | number | undefined, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return fallback
}

function MarkdownImage({
  src,
  alt = '',
  title,
  width,
  height,
}: {
  src?: string
  alt?: string
  title?: string
  width?: string | number
  height?: string | number
}) {
  if (!src) return null

  const resolvedWidth = getMarkdownImageDimension(width, 1200)
  const resolvedHeight = getMarkdownImageDimension(height, 800)

  return (
    <div className="mb-6">
      <Zoom wrapElement="div">
        <div className="overflow-hidden rounded-lg border border-gray-800">
          <Image
            src={src}
            alt={alt}
            title={title}
            width={resolvedWidth}
            height={resolvedHeight}
            sizes="100vw"
            unoptimized
            className="h-auto w-full cursor-zoom-in"
          />
        </div>
      </Zoom>
    </div>
  )
}

export function MarkdownRenderer({ content, className = '', onCommentsExtracted, variant = 'default' }: MarkdownRendererProps) {
  if (!content) {
    content = ''
  } else {
    content = content
      .split('\n')
      .map(line => line.trim() === '.' ? '\n\n&nbsp;\n\n' : line)
      .join('\n')
  }

  const { filtered: sanitizedContent, comments } = React.useMemo(() => parseCustomComments(content), [content])
  React.useEffect(() => {
    if (onCommentsExtracted) {
      onCommentsExtracted(comments)
    }
  }, [comments, onCommentsExtracted])

  if (variant === 'compact') {
    return (
      <div className={`max-w-none text-gray-300 text-xs leading-relaxed ${className}`.trim()}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            h1: ({ ...props }) => <h1 className="text-lg font-bold text-blue-400 border-b border-gray-800 pb-1 mb-4" {...props} />,
            h2: ({ ...props }) => <h2 className="text-base font-semibold text-blue-300 mb-4" {...props} />,
            h3: ({ ...props }) => <h3 className="text-sm font-semibold text-blue-200 mb-4" {...props} />,
            p: ({ ...props }) => <p className="mb-5 leading-relaxed" {...props} />,
            ul: ({ ...props }) => <ul className="mb-5 list-disc list-inside space-y-1 ml-2" {...props} />,
            ol: ({ ...props }) => <ol className="mb-5 list-decimal list-inside space-y-1 ml-2" {...props} />,
            li: ({ ...props }) => <li className="list-item" {...props} />,
            strong: ({ ...props }) => <strong className="font-bold text-blue-300/90" {...props} />,
            em: ({ ...props }) => <em className="italic opacity-80" {...props} />,
            a: ({ ...props }) => (
              <a
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            code: ({ inline, children, ...props }: any) =>
              inline ? (
                <code
                  className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <CodeBlockWrapper isDark={false}>
                  <pre className="bg-gray-900 p-3 rounded-lg text-[10px] leading-snug font-mono max-w-full border border-gray-800 overflow-x-auto mb-6">
                    <code className="text-gray-200" {...props}>
                      {children}
                    </code>
                  </pre>
                </CodeBlockWrapper>
              ),
            blockquote: ({ ...props }) => (
              <blockquote
                className="border-l-4 border-blue-500/50 bg-blue-500/5 pl-3 py-1.5 text-[11px] opacity-90 mb-4 rounded-r-sm"
                {...props}
              />
            ),
          }}
        >
          {sanitizedContent}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div className={`max-w-none text-gray-300 text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-2xl font-bold mb-4 text-blue-400 border-b border-gray-800 pb-2 tracking-tight" {...props} />
          ),
          h2: ({ ...props }) => <h2 className="text-xl font-semibold mb-4 text-blue-300 tracking-tight" {...props} />,
          h3: ({ ...props }) => <h3 className="text-lg font-semibold mb-4 text-blue-200" {...props} />,
          p: ({ ...props }) => <p className="mb-5 leading-relaxed text-gray-300" {...props} />,
          ul: ({ ...props }) => <ul className="mb-5 space-y-1.5 list-disc list-inside ml-1" {...props} />,
          ol: ({ ...props }) => <ol className="mb-5 space-y-1.5 list-decimal list-inside ml-1" {...props} />,
          li: ({ ...props }) => <li className="ml-4 mb-2 list-item" {...props} />,
          code: ({ inline, children, ...props }: any) =>
            inline ? (
              <code className="bg-gray-800 px-2 py-1 rounded text-xs font-mono text-blue-300 font-medium" {...props}>
                {children}
              </code>
            ) : (
              <CodeBlockWrapper isDark>
                <pre className="bg-gray-900 p-4 rounded-xl text-sm font-mono max-w-full border border-gray-800 shadow-sm">
                  <code className="max-w-full text-gray-200 leading-relaxed" {...props}>{children}</code>
                </pre>
              </CodeBlockWrapper>
            ),
          a: ({ ...props }) => <a className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
          img: ({ src, alt, title, width, height }) => (
            <MarkdownImage
              src={typeof src === 'string' ? src : undefined}
              alt={alt}
              title={title}
              width={width}
              height={height}
            />
          ),
          blockquote: ({ ...props }) => (
            <BlockquoteWrapper isDark>
              <blockquote
                className="border-l-4 border-blue-400 bg-blue-500/5 pl-4 pr-2 py-2 text-gray-300 rounded-md italic leading-relaxed"
                {...props}
              />
            </BlockquoteWrapper>
          ),
          hr: () => <hr className="mb-6 border-gray-800" />,
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  )
}

export function RulesMarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  let normalizedContent = content || ''
  if (normalizedContent) {
    normalizedContent = normalizedContent
      .split('\n')
      .map(line => line.trim() === '.' ? '' : line)
      .join('\n')
  }

  const { filtered: sanitizedContent } = React.useMemo(() => parseCustomComments(normalizedContent), [normalizedContent])

  return (
    <div className={`max-w-none text-gray-800 dark:text-gray-200 text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
          li: ({ ...props }) => <li className="ml-6 list-disc mb-1" {...props} />,
          strong: ({ ...props }) => <strong className="font-bold text-gray-900 dark:text-orange-400" {...props} />,
          em: ({ ...props }) => <em className="italic text-gray-700 dark:text-gray-300" {...props} />,
          a: ({ ...props }) => <a className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
          code: ({ inline, children, ...props }: any) =>
            inline ? (
              <code className="bg-orange-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono text-orange-800 dark:text-orange-300 font-semibold" {...props}>
                {children}
              </code>
            ) : (
              <CodeBlockWrapper isDark={false}>
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm font-mono max-w-full border border-gray-300 dark:border-gray-700">
                  <code className="text-gray-900 dark:text-gray-100" {...props}>{children}</code>
                </pre>
              </CodeBlockWrapper>
            ),
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer
