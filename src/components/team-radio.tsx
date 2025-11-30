"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Radio, Mic2 } from "lucide-react"

const MESSAGES = [
    { id: 1, driver: "VER", team: "Red Bull", message: "Tyres are starting to go, mate.", time: "L14" },
    { id: 2, driver: "NOR", team: "McLaren", message: "Gap to Max is 2.5 seconds. Push now.", time: "L15" },
    { id: 3, driver: "HAM", team: "Mercedes", message: "Box box, box box.", time: "L18" },
]

export function TeamRadio() {
    return (
        <Card className="bg-zinc-900/50 border-zinc-800 h-full">
            <CardHeader className="py-3 px-4 border-b border-zinc-800">
                <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                    <Radio className="w-3 h-3 text-green-500 animate-pulse" />
                    Team Radio Feed
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-zinc-800/50">
                    {MESSAGES.map((msg) => (
                        <div key={msg.id} className="p-3 hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-sm">{msg.driver}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase">{msg.team}</span>
                                </div>
                                <span className="text-[10px] font-mono text-zinc-600">{msg.time}</span>
                            </div>
                            <p className="text-xs text-zinc-300 italic">"{msg.message}"</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
