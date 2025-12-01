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
        <Card className="bg-zinc-900/50 border-zinc-800 h-full flex flex-col overflow-hidden group hover:border-zinc-700 transition-colors">
            <CardHeader className="py-3 px-4 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm flex flex-row items-center justify-between sticky top-0 z-10">
                <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                    <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                    Team Radio
                </CardTitle>
                <div className="flex gap-1">
                    <span className="w-0.5 h-2 bg-red-500 animate-[music-bar_1s_ease-in-out_infinite]" />
                    <span className="w-0.5 h-2 bg-red-500 animate-[music-bar_1s_ease-in-out_infinite_0.1s]" />
                    <span className="w-0.5 h-2 bg-red-500 animate-[music-bar_1s_ease-in-out_infinite_0.2s]" />
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar bg-zinc-950/30">
                <div className="flex flex-col">
                    {MESSAGES.map((msg, i) => (
                        <div
                            key={msg.id}
                            className={`p-4 border-b border-zinc-800/30 hover:bg-zinc-900/50 transition-all cursor-pointer group/msg relative overflow-hidden ${i === 0 ? 'bg-red-500/5' : ''}`}
                        >
                            {/* Team Color Strip */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${msg.team === 'Red Bull' ? 'bg-blue-600' :
                                    msg.team === 'McLaren' ? 'bg-orange-500' :
                                        'bg-teal-500'
                                }`} />

                            <div className="flex justify-between items-start mb-2 pl-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-sm tracking-tight">{msg.driver}</span>
                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${msg.team === 'Red Bull' ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' :
                                            msg.team === 'McLaren' ? 'bg-orange-900/30 text-orange-400 border border-orange-800/50' :
                                                'bg-teal-900/30 text-teal-400 border border-teal-800/50'
                                        }`}>
                                        {msg.team}
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                                    {msg.time}
                                </span>
                            </div>

                            <div className="pl-3 relative">
                                <p className="text-sm text-zinc-300 font-medium leading-snug group-hover/msg:text-white transition-colors">
                                    "{msg.message}"
                                </p>
                                <Mic2 className="w-3 h-3 text-zinc-600 absolute -left-2 top-1 opacity-0 group-hover/msg:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
