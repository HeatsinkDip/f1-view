"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flag } from "lucide-react"
import { getRaceControl } from "@/lib/api"

interface RaceControlFeedProps {
    year?: number
    location?: string
    sessionType?: string
}

export function RaceControlFeed({ year = 2024, location = "Lusail", sessionType = "Race" }: RaceControlFeedProps) {
    const [messages, setMessages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getRaceControl(year, location, sessionType)
            .then((data) => {
                setMessages(data.messages || [])
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false))
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
            <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Flag className="w-5 h-5 text-white" />
                    Race Control
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[300px] overflow-y-auto custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="p-6 text-center text-zinc-500 font-mono text-sm">No messages available.</div>
                ) : (
                    <div className="divide-y divide-zinc-800/50">
                        {messages.map((msg, idx) => {
                            let color = "text-white"
                            if (msg.message.includes("YELLOW")) color = "text-yellow-500"
                            if (msg.message.includes("RED")) color = "text-red-500"
                            if (msg.message.includes("GREEN") || msg.message.includes("CLEAR")) color = "text-green-500"

                            return (
                                <div key={idx} className="flex gap-4 p-4 hover:bg-zinc-800/30 transition-colors">
                                    <div className="text-xs font-mono text-zinc-500 pt-1">
                                        {new Date(msg.time * 1000).toISOString().substr(11, 8)}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-bold uppercase text-sm ${color}`}>{msg.message}</div>
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
