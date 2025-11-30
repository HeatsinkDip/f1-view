"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle, HelpCircle } from "lucide-react"

const MARKET_MOVES = [
    { driver: "Lewis Hamilton", to: "Ferrari", status: "confirmed" },
    { driver: "Carlos Sainz", to: "Williams", status: "confirmed" },
    { driver: "Andrea Kimi Antonelli", to: "Mercedes", status: "rumor" },
    { driver: "Jack Doohan", to: "Alpine", status: "rumor" },
]

export function DriverMarket() {
    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Users className="w-5 h-5 text-blue-500" />
                    Driver Market 2025
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-zinc-800/50">
                    {MARKET_MOVES.map((move, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors">
                            <div>
                                <div className="font-bold text-lg">{move.driver}</div>
                                <div className="text-xs text-zinc-500 uppercase font-mono flex items-center gap-1">
                                    To: <span className="text-white">{move.to}</span>
                                </div>
                            </div>
                            <div>
                                {move.status === "confirmed" ? (
                                    <div className="flex items-center gap-1 text-green-500 text-xs uppercase font-bold border border-green-900/50 bg-green-950/30 px-2 py-1 rounded">
                                        <CheckCircle className="w-3 h-3" /> Confirmed
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-orange-500 text-xs uppercase font-bold border border-orange-900/50 bg-orange-950/30 px-2 py-1 rounded">
                                        <HelpCircle className="w-3 h-3" /> Rumor
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
