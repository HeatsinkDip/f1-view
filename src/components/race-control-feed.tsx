"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flag } from "lucide-react"
import { getRaceControl, RaceControlMessage } from "@/lib/api"

interface RaceControlFeedProps {
    year?: number
    location?: string
    sessionType?: string
}

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
    const [messages, setMessages] = useState<RaceControlMessage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true
        setLoading(true)
        getRaceControl(year, location, sessionType)
            .then((data) => {
                if (active) setMessages(data.messages || [])
            })
            .catch(() => {
                if (active) setMessages([])
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [year, location, sessionType])

    if (loading) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-zinc-800/50 pb-4">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg text-zinc-500">
                        Loading Feed...
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[200px]" />
            </Card>
        )
    }

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-zinc-800/50 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Flag className="w-5 h-5 text-white" />
                    Race Control
                </CardTitle>
                {messages.length > 0 && (
                    <span className="text-[10px] font-mono text-zinc-500">{messages.length} LOGS</span>
                )}
            </CardHeader>
            <CardContent className="p-0 max-h-[340px] overflow-y-auto custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="p-6 text-center text-zinc-500 font-mono text-sm">No messages available.</div>
                ) : (
                    <div className="divide-y divide-zinc-800/50">
                        {messages.map((msg, idx) => {
                            const upper = (msg.message || "").toUpperCase()
                            const flag = (msg.flag || "").toUpperCase()
                            let color = "text-white"
                            if (flag.includes("YELLOW") || upper.includes("YELLOW") || upper.includes("SAFETY CAR")) {
                                color = "text-yellow-400"
                            } else if (flag.includes("RED") || upper.includes("RED FLAG")) {
                                color = "text-red-500"
                            } else if (flag.includes("GREEN") || upper.includes("GREEN") || upper.includes("CLEAR")) {
                                color = "text-green-400"
                            } else if (flag.includes("CHEQUERED")) {
                                color = "text-zinc-200"
                            }

                            return (
                                <div key={`${idx}-${msg.time}`} className="flex gap-3 p-4 hover:bg-zinc-800/30 transition-colors">
                                    <div className="text-xs font-mono text-zinc-500 pt-0.5 shrink-0">
                                        {formatMessageTime(msg.time)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            {msg.lap && (
                                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                                    L{msg.lap}
                                                </span>
                                            )}
                                            {msg.category && (
                                                <span className="text-[10px] font-mono uppercase text-zinc-500">
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
