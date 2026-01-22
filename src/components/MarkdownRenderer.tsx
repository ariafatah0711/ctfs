'use client'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { Copy, Check, ChevronsRight, ChevronsDown } from 'lucide-react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

// Helper function to extract text from React children
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

// Wrapper component untuk code block dengan toggle wrap
function CodeBlockWrapper({ children, isDark = true }: { children: React.ReactNode; isDark?: boolean }) {
  const [isWrapped, setIsWrapped] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)
  const preRef = React.useRef<HTMLPreElement>(null)

  // Check if content overflows
  React.useEffect(() => {
    if (preRef.current) {
      const hasScroll = preRef.current.scrollWidth > preRef.current.clientWidth
      setHasOverflow(hasScroll)
    }
  }, [])

  // children adalah <pre> element, clone dan update classNamenya based on state
  const childElement = React.isValidElement(children) ? (children as React.ReactElement<any>) : null
  const modifiedChild = childElement
    ? React.cloneElement(childElement, {
        ref: preRef,
        className: `${(childElement.props as any)?.className || ''} ${
          isWrapped ? 'whitespace-normal break-words' : 'whitespace-pre overflow-x-auto'
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
    <div className="relative my-3">
      {hasOverflow && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button
            type="button"
            onClick={handleCopy}
            className={`p-1.5 rounded transition-colors ${
              isDark
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
            className={`p-1.5 rounded transition-colors ${
              isDark
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

// Wrapper component untuk blockquote dengan toggle wrap
function BlockquoteWrapper({ children, isDark = true }: { children: React.ReactNode; isDark?: boolean }) {
  const [isWrapped, setIsWrapped] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)
  const blockquoteRef = React.useRef<HTMLQuoteElement>(null)

  // Check if content overflows
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
        className: `${(childElement.props as any)?.className || ''} ${
          isWrapped ? 'break-words whitespace-normal' : 'whitespace-nowrap overflow-x-auto'
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
    <div className="relative">
      {hasOverflow && (
        <div className="absolute -top-8 right-0 flex gap-1 z-10">
          {/* <button
            type="button"
            onClick={handleCopy}
            className={`p-1.5 rounded transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-orange-300'
                : 'bg-orange-100 hover:bg-orange-200 text-orange-600'
            }`}
            title={copied ? 'Copied!' : 'Copy'}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button> */}
          <button
            type="button"
            onClick={() => setIsWrapped(!isWrapped)}
            className={`p-1.5 rounded transition-colors ${
              isDark
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

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) {
    content = ''
  } else {
    // Replace lines that contain only "." with empty lines
    content = content
      .split('\n')
      .map(line => line.trim() === '.' ? '' : line)
      .join('\n')
  }

  return (
    <div className={`max-w-none text-gray-200 text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({...props}) => <h1 className="text-3xl font-extrabold mt-6 mb-3 text-orange-400 border-b border-gray-700 pb-2" {...props} />,
          h2: ({...props}) => <h2 className="text-2xl font-bold mt-5 mb-3 text-orange-300" {...props} />,
          h3: ({...props}) => <h3 className="text-xl font-semibold mt-4 mb-2 text-orange-200" {...props} />,
          p: ({...props}) => <p className="mb-3 leading-relaxed text-justify" {...props} />,
          ul: ({...props}) => <ul className="mb-3 space-y-1 list-disc list-inside" {...props} />,
          ol: ({...props}) => <ol className="mb-3 space-y-1 list-decimal list-inside" {...props} />,
          li: ({...props}) => <li className="ml-6 list-item" {...props} />,
          code: ({inline, children, ...props}: any) =>
            inline ? (
              <code className="bg-gray-800 px-2 py-1 rounded text-xs font-mono text-orange-300 break-all max-w-full break-words" {...props}>
                {children}
              </code>
            ) : (
              <CodeBlockWrapper isDark>
                <pre className="bg-gray-900 p-4 rounded-lg text-sm font-mono max-w-full border border-gray-700">
                  <code className="max-w-full" {...props}>{children}</code>
                </pre>
              </CodeBlockWrapper>
            ),
          a: ({...props}) => <a className="text-orange-400 hover:text-orange-300 hover:underline underline font-medium transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
          img: ({...props}) => (
            <img
              {...props}
              loading="lazy"
              className="max-w-full h-auto rounded-md my-2 w-full"
            />
          ),
          blockquote: ({...props}) => (
            <BlockquoteWrapper isDark>
              <blockquote
                className="border-l-4 border-orange-400 pl-4 italic text-gray-300 bg-gray-800/50 rounded-md my-3"
                {...props}
              />
            </BlockquoteWrapper>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export function RulesMarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Replace lines that contain only "." with empty lines
  if (content) {
    content = content
      .split('\n')
      .map(line => line.trim() === '.' ? '' : line)
      .join('\n')
  }

  return (
    <div className={`max-w-none text-gray-800 dark:text-gray-200 text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({...props}) => <p className="mb-2 leading-relaxed" {...props} />,
          li: ({...props}) => <li className="ml-6 list-disc mb-1" {...props} />,
          strong: ({...props}) => <strong className="font-bold text-gray-900 dark:text-orange-400" {...props} />,
          em: ({...props}) => <em className="italic text-gray-700 dark:text-gray-300" {...props} />,
          a: ({...props}) => <a className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
          code: ({inline, children, ...props}: any) =>
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
        {content}
      </ReactMarkdown>
    </div>
  )
}

// Backwards-compatible default export for existing imports
export default MarkdownRenderer
