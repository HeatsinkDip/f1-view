"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Radio, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

const RADIOS = [
    { driver: "Max Verstappen", team: "Red Bull", content: "The car is sliding everywhere mate!", lap: 12 },
    { driver: "Lando Norris", team: "McLaren", content: "I have no grip, tyres are gone.", lap: 18 },
    { driver: "Fernando Alonso", team: "Aston Martin", content: "Wow, what a move! Leave me alone, I know what I'm doing.", lap: 25 },
]

export function RadioHighlights() {
    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Radio className="w-5 h-5 text-red-500" />
                    Team Radio
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-zinc-800/50">
                    {RADIOS.map((radio, idx) => (
                        <div key={idx} className="p-4 hover:bg-zinc-800/30 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="font-bold text-sm">{radio.driver}</div>
                                    <div className="text-xs text-zinc-500 uppercase font-mono">{radio.team}</div>
                                </div>
                                <div className="text-xs font-mono text-zinc-600">L{radio.lap}</div>
                            </div>
                            <div className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800 italic text-zinc-300 text-sm mb-2">
                                "{radio.content}"
                            </div>
                            <Button size="sm" variant="ghost" className="w-full text-xs h-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                <Play className="w-3 h-3 mr-2" /> Play Audio
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
