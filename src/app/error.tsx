"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
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
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-background to-background dark:from-red-900/20 dark:via-zinc-950 dark:to-black -z-10" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://media.formula1.com/image/upload/f_auto/q_auto/v1677244985/fom-website/2023/Misc/texture-carbon.png')] opacity-5 dark:opacity-20 -z-10" />

            <div className="max-w-md w-full text-center space-y-8 relative z-10">
                <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mx-auto border border-red-600/50 shadow-[0_0_30px_rgba(220,38,38,0.2)] animate-pulse">
                    <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Engine Failure
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm">
                        We&apos;ve encountered a critical mechanical issue.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-4 text-left font-mono text-xs text-red-600 dark:text-red-400 overflow-auto max-h-32">
                    {error.message || "Unknown error occurred"}
                    {error.digest && <div className="mt-2 text-muted-foreground">Digest: {error.digest}</div>}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={reset}
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider"
                    >
                        <RotateCcw className="mr-2 w-4 h-4" />
                        Restart Engine
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="font-bold uppercase tracking-wider"
                    >
                        <Link href="/">
                            <Home className="mr-2 w-4 h-4" />
                            Return to Pits
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
