import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Flag, ArrowLeft } from "lucide-react"

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black -z-10" />

            <div className="max-w-md w-full text-center space-y-8 relative z-10">
                <div className="w-32 h-32 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto border-4 border-zinc-800 shadow-2xl">
                    <span className="text-6xl font-black italic text-zinc-700">404</span>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-3">
                        <Flag className="w-8 h-8 text-yellow-500" />
                        Off Track
                    </h1>
                    <p className="text-zinc-400 font-mono text-sm">
                        You've gone wide! This page doesn't exist.
                    </p>
                </div>

                <Button
                    asChild
                    size="lg"
                    className="bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-wider"
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
