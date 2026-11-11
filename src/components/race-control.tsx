"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function RaceControl() {
    return (
        <Card className="bg-card/80 dark:bg-zinc-900/50 border-border">
            <CardHeader className="py-3 px-4 border-b border-border">
                <CardTitle className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-yellow-500" />
                    Race Control
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/60">
                    <div className="p-3 flex gap-3 items-start bg-amber-500/10 border-l-2 border-amber-500">
                        <span className="text-[10px] font-mono text-amber-700 dark:text-yellow-500 mt-0.5">14:32</span>
                        <p className="text-xs text-amber-900 dark:text-yellow-200 font-medium">YELLOW FLAG SECTOR 2</p>
                    </div>
                    <div className="p-3 flex gap-3 items-start border-l-2 border-transparent">
                        <span className="text-[10px] font-mono text-muted-foreground mt-0.5">14:30</span>
                        <p className="text-xs text-foreground">DRS ENABLED</p>
                    </div>
                    <div className="p-3 flex gap-3 items-start border-l-2 border-transparent">
                        <span className="text-[10px] font-mono text-muted-foreground mt-0.5">14:28</span>
                        <p className="text-xs text-foreground">TRACK CLEAR</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
