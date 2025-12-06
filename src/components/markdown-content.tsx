"use client"

import ReactMarkdown from "react-markdown"

interface MarkdownContentProps {
    content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {

    return (
        <ReactMarkdown
            components={{
                h1: ({ node, ...props }) => <h1 className="text-lg sm:text-xl font-bold mb-4" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-base sm:text-lg font-semibold mb-3" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-sm sm:text-md font-medium mb-2" {...props} />,
                p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4" {...props} />,
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
            }}
        >
            {content}
        </ReactMarkdown>
    )
}
