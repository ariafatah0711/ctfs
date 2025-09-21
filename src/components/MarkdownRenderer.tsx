import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Simple and robust markdown parser
  const parseMarkdown = (text: string) => {
    let html = text

    // Split into lines for better processing
    const lines = html.split('\n')
    const processedLines: string[] = []
    let inCodeBlock = false
    let inList = false
    let listType = ''

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]

      // Handle code blocks
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true
          processedLines.push('<pre class="bg-gray-100 p-3 rounded-md overflow-x-auto my-2"><code class="text-sm font-mono">')
        } else {
          inCodeBlock = false
          processedLines.push('</code></pre>')
        }
        continue
      }

      if (inCodeBlock) {
        processedLines.push(line)
        continue
      }

      // Process inline elements
      line = line.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
      line = line.replace(/__([^_]+)__/g, '<strong class="font-semibold">$1</strong>')
      line = line.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
      line = line.replace(/_([^_]+)_/g, '<em class="italic">$1</em>')
      line = line.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')

      // Handle headers
      if (line.match(/^### (.+)$/)) {
        line = line.replace(/^### (.+)$/, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
        inList = false
      } else if (line.match(/^## (.+)$/)) {
        line = line.replace(/^## (.+)$/, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
        inList = false
      } else if (line.match(/^# (.+)$/)) {
        line = line.replace(/^# (.+)$/, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
        inList = false
      }
      // Handle blockquotes
      else if (line.match(/^> (.+)$/)) {
        line = line.replace(/^> (.+)$/, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">$1</blockquote>')
        inList = false
      }
      // Handle lists
      else if (line.match(/^[\s]*[-*] (.+)$/)) {
        if (!inList || listType !== 'ul') {
          if (inList) processedLines.push('</ul>')
          processedLines.push('<ul class="my-2">')
          inList = true
          listType = 'ul'
        }
        line = line.replace(/^[\s]*[-*] (.+)$/, '<li class="ml-4">$1</li>')
      } else if (line.match(/^[\s]*\d+\. (.+)$/)) {
        if (!inList || listType !== 'ol') {
          if (inList) processedLines.push('</ol>')
          processedLines.push('<ol class="my-2">')
          inList = true
          listType = 'ol'
        }
        line = line.replace(/^[\s]*\d+\. (.+)$/, '<li class="ml-4">$1</li>')
      }
      // Handle empty lines and regular text
      else {
        if (inList) {
          processedLines.push(`</${listType}>`)
          inList = false
          listType = ''
        }

        if (line.trim() === '') {
          processedLines.push('<br>')
        } else {
          processedLines.push(`<p class="my-2">${line}</p>`)
        }
        continue
      }

      processedLines.push(line)
    }

    // Close any remaining list
    if (inList) {
      processedLines.push(`</${listType}>`)
    }

    return processedLines.join('\n')
  }

  const htmlContent = parseMarkdown(content)

  return (
    <div
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
