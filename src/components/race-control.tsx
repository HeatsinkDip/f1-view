"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function RaceControl() {
    return (
        <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="py-3 px-4 border-b border-zinc-800">
                <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-yellow-500" />
                    Race Control
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-zinc-800/50">
                    <div className="p-3 flex gap-3 items-start bg-yellow-500/10 border-l-2 border-yellow-500">
                        <span className="text-[10px] font-mono text-yellow-500 mt-0.5">14:32</span>
                        <p className="text-xs text-yellow-200 font-medium">YELLOW FLAG SECTOR 2</p>
                    </div>
                    <div className="p-3 flex gap-3 items-start border-l-2 border-transparent">
                        <span className="text-[10px] font-mono text-zinc-500 mt-0.5">14:30</span>
                        <p className="text-xs text-zinc-300">DRS ENABLED</p>
                    </div>
                    <div className="p-3 flex gap-3 items-start border-l-2 border-transparent">
                        <span className="text-[10px] font-mono text-zinc-500 mt-0.5">14:28</span>
                        <p className="text-xs text-zinc-300">TRACK CLEAR</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
