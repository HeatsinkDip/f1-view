import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Flag, ArrowLeft } from "lucide-react"

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/5 via-background to-background dark:from-zinc-900 dark:via-zinc-950 dark:to-black -z-10" />

            <div className="max-w-md w-full text-center space-y-8 relative z-10">
                <div className="w-32 h-32 bg-card rounded-full flex items-center justify-center mx-auto border-4 border-border shadow-xl dark:shadow-2xl">
                    <span className="text-6xl font-black italic text-muted-foreground">404</span>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-3">
                        <Flag className="w-8 h-8 text-amber-600 dark:text-yellow-500" />
                        Off Track
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm">
                        You&apos;ve gone wide! This page doesn&apos;t exist.
                    </p>
                </div>

                <Button
                    asChild
                    size="lg"
                    className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold uppercase tracking-wider"
                >
                    <Link href="/">
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back to Track
                    </Link>
                </Button>
            </div>
        </div>
    )
}
