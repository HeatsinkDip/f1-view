"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer, ArrowRight } from "lucide-react"

export function StrategyPredictor() {
    return (
        <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="py-3 px-4 border-b border-zinc-800 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                    <Timer className="w-3 h-3 text-purple-500" />
                    AI Strategy
                </CardTitle>
                <span className="text-[10px] font-bold bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full">
                    OPTIMAL
                </span>
            </CardHeader>
            <CardContent className="p-4">
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-500/20" />
                            <span className="font-bold">Soft</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600" />
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-white ring-2 ring-white/20" />
                            <span className="font-bold">Hard</span>
                        </div>
                    </div>

                    <div className="relative pt-6 pb-2">
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full w-[35%] bg-red-500" />
                            <div className="h-full w-[65%] bg-white" />
                        </div>

                        {/* Pit Window Marker */}
                        <div className="absolute top-0 left-[35%] -translate-x-1/2 flex flex-col items-center">
                            <div className="text-[10px] font-mono text-zinc-400 mb-1">LAP 18-22</div>
                            <div className="w-0.5 h-8 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-zinc-950/50 p-2 rounded border border-zinc-800">
                            <div className="text-zinc-500 mb-1">Est. Pit Loss</div>
                            <div className="font-mono font-bold text-white">22.4s</div>
                        </div>
                        <div className="bg-zinc-950/50 p-2 rounded border border-zinc-800">
                            <div className="text-zinc-500 mb-1">Traffic Risk</div>
                            <div className="font-mono font-bold text-yellow-500">MED</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
