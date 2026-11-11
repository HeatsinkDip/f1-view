import { F1Loader } from "@/components/f1-loader"

export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/5 via-background to-background dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
            <div className="relative z-10">
                <F1Loader />
            </div>
        </div>
    )
}
