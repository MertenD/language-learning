import React from "react";

type PracticeContainerProps = {
    children: React.ReactNode
}

export default function PracticeContainer({ children }: PracticeContainerProps) {

    return <div className="p-4 md:px-10 md:py-6 h-full">
        <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8 h-full">
            {children}
        </div>
    </div>
}