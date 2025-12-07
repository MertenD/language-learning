import { useEffect, useState } from "react"

export function useSmoothText(text: string, speed: number = 20) {
    const [displayedText, setDisplayedText] = useState("")
    const [targetText, setTargetText] = useState(text)

    useEffect(() => {
        setTargetText(text)
    }, [text])

    useEffect(() => {
        if (displayedText === targetText) return

        const timeout = setTimeout(() => {
            setDisplayedText(targetText.slice(0, Math.min(displayedText.length + 5, targetText.length)))
        }, speed)

        return () => clearTimeout(timeout)
    }, [displayedText, targetText, speed])

    return displayedText
}
