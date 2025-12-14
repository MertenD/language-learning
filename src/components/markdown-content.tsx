"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'

interface MarkdownContentProps {
    content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: ({ node, ...props }) => <h1 className="text-xl sm:text-xxl font-bold mb-4" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-lg sm:text-xl font-semibold mb-3" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-md sm:text-lg font-medium mb-2" {...props} />,
                p: ({ node, ...props }) => <p {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4" {...props} />,
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
                hr: ({ node, ...props }) => <hr className="my-4 border-muted-foreground/30" {...props} />,
            }}
        >
            {content}
        </ReactMarkdown>
    )
}
