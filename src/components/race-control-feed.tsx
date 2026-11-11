"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flag } from "lucide-react"
import { getRaceControl, RaceControlMessage } from "@/lib/api"
import { useAsyncData } from "@/lib/use-async-data"

interface RaceControlFeedProps {
    year?: number
    location?: string
    sessionType?: string
}

const EMPTY_MESSAGES: RaceControlMessage[] = []

function formatMessageTime(rawTime: unknown): string {
    if (typeof rawTime === "string" && rawTime.trim()) {
        return rawTime.trim()
    }
    if (typeof rawTime === "number" && Number.isFinite(rawTime)) {
        return new Date(rawTime * 1000).toISOString().slice(11, 19)
    }
    return "--:--:--"
}

export function RaceControlFeed({
    year = new Date().getFullYear(),
    location = "Lusail",
    sessionType = "Race",
}: RaceControlFeedProps) {
    const { data: messages, loading } = useAsyncData(
        `race_control:${year}:${location}:${sessionType}`,
        () => getRaceControl(year, location, sessionType).then((data) => data.messages || []).catch(() => []),
        EMPTY_MESSAGES
    )

    if (loading) {
        return (
            <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-border/60 pb-4">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg text-muted-foreground">
                        Loading Feed...
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[200px]" />
            </Card>
        )
    }

    return (
        <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-border/60 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Flag className="w-5 h-5 text-foreground" />
                    Race Control
                </CardTitle>
                {messages.length > 0 && (
                    <span className="text-[10px] font-mono text-muted-foreground">{messages.length} LOGS</span>
                )}
            </CardHeader>
            <CardContent className="p-0 max-h-[340px] overflow-y-auto custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground font-mono text-sm">No messages available.</div>
                ) : (
                    <div className="divide-y divide-border/60">
                        {messages.map((msg, idx) => {
                            const upper = (msg.message || "").toUpperCase()
                            const flag = (msg.flag || "").toUpperCase()
                            let color = "text-foreground"
                            if (flag.includes("YELLOW") || upper.includes("YELLOW") || upper.includes("SAFETY CAR")) {
                                color = "text-amber-700 dark:text-yellow-400"
                            } else if (flag.includes("RED") || upper.includes("RED FLAG")) {
                                color = "text-red-600 dark:text-red-500"
                            } else if (flag.includes("GREEN") || upper.includes("GREEN") || upper.includes("CLEAR")) {
                                color = "text-emerald-700 dark:text-green-400"
                            } else if (flag.includes("CHEQUERED")) {
                                color = "text-foreground"
                            }

                            return (
                                <div key={`${idx}-${msg.time}`} className="flex gap-3 p-4 hover:bg-accent/50 transition-colors">
                                    <div className="text-xs font-mono text-muted-foreground pt-0.5 shrink-0">
                                        {formatMessageTime(msg.time)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            {msg.lap && (
                                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-foreground">
                                                    L{msg.lap}
                                                </span>
                                            )}
                                            {msg.category && (
                                                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                                                    {msg.category}
                                                </span>
                                            )}
                                        </div>
                                        <div className={`font-bold uppercase text-xs leading-relaxed ${color}`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
