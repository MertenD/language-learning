import { useEffect, useState } from "react"

export function useSmoothText(text: string, isStreaming: boolean, speed: number = 20) {
    const [displayedText, setDisplayedText] = useState("")
    const [targetText, setTargetText] = useState(text)

    useEffect(() => {
        setTargetText(text)
    }, [text])

    useEffect(() => {
        if (displayedText === targetText || !isStreaming) return

        const timeout = setTimeout(() => {
            setDisplayedText(targetText.slice(0, Math.min(displayedText.length + 5, targetText.length)))
        }, speed)

        return () => clearTimeout(timeout)
    }, [displayedText, targetText, speed, isStreaming])

    return isStreaming ? displayedText : targetText
}
