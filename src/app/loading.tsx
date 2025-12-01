import { F1Loader } from "@/components/f1-loader"

export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black" />
            <div className="relative z-10">
                <F1Loader />
            </div>
        </div>
    )
}
