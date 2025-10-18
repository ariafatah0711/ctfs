'use client'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none text-gray-200 text-sm ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
          h2: ({...props}) => <h2 className="text-xl font-semibold mt-4 mb-2" {...props} />,
          h3: ({...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
          code: ({inline, children, ...props}: any) =>
            inline ? (
              <code className="bg-gray-800 px-1 py-0.5 rounded text-sm font-mono break-all max-w-full break-words" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-gray-900 p-3 rounded-md overflow-x-auto text-sm font-mono whitespace-pre-wrap break-all max-w-full">
                <code className="break-all max-w-full break-words" {...props}>{children}</code>
              </pre>
            ),
          a: ({...props}) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
          blockquote: ({...props}) => (
            <blockquote
              className="border-l-4 border-yellow-400 pl-4 italic text-gray-300 bg-[#1a1a2e] rounded-md my-3 py-2"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export function RulesMarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`max-w-none text-gray-800 dark:text-gray-200 text-sm ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({...props}) => <p className="mb-1" {...props} />,
          li: ({...props}) => <li className="ml-5 list-disc" {...props} />,
          strong: ({...props}) => <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />,
          em: ({...props}) => <em className="italic" {...props} />,
          a: ({...props}) => <a className="text-orange-600 dark:text-orange-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
          code: ({inline, children, ...props}: any) =>
            inline ? (
              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono text-gray-800 dark:text-gray-100" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md overflow-x-auto text-sm font-mono whitespace-pre-wrap break-all">
                <code className="break-all" {...props}>{children}</code>
              </pre>
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
