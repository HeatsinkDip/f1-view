"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RotateCcw } from "lucide-react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <html lang="en">
            <body className="bg-background text-foreground">
                <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
                    <div className="max-w-md w-full text-center space-y-8 relative z-10">
                        <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mx-auto border border-red-600/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                            <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-500" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                                System Crash
                            </h1>
                            <p className="text-muted-foreground font-mono text-sm">
                                A fatal error occurred in the application.
                            </p>
                        </div>

                        <Button
                            onClick={reset}
                            size="lg"
                            className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider w-full"
                        >
                            <RotateCcw className="mr-2 w-4 h-4" />
                            Reboot System
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    )
}
