'use client'

import { useEffect, useRef } from 'react'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'
import 'highlight.js/styles/github-dark-dimmed.css'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('bash', bash)

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (ref.current) {
      delete ref.current.dataset.highlighted
      hljs.highlightElement(ref.current)
    }
  }, [code])

  return (
    <div className="rounded-lg overflow-hidden text-sm">
      <pre className="overflow-auto p-4 bg-zinc-900 dark:bg-zinc-950 rounded-lg">
        <code ref={ref} className={language ? `language-${language}` : ''}>
          {code}
        </code>
      </pre>
    </div>
  )
}
