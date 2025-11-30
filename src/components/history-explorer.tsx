"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Trophy, AlertCircle } from "lucide-react"
import { getHistory } from "@/lib/api"

export function HistoryExplorer() {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [location, setLocation] = useState("Lusail") // Default to current context if possible

    useEffect(() => {
        // In a real app, this would react to the selected race in the dashboard
        // For now, we fetch for the default location
        getHistory(location)
            .then((data) => {
                if (data.history) {
                    setHistory(data.history)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [location])

    if (loading) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-zinc-800/50 pb-4">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                        <History className="w-5 h-5 text-red-600" />
                        Track History
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
                    <History className="w-5 h-5 text-red-600" />
                    Track History
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="mb-6">
                    <Select defaultValue="wins">
                        <SelectTrigger className="bg-zinc-950 border-zinc-800">
                            <SelectValue placeholder="Select Metric" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="wins">Past Winners</SelectItem>
                            <SelectItem value="poles" disabled>Pole Positions (Coming Soon)</SelectItem>
                            <SelectItem value="fastest" disabled>Fastest Laps (Coming Soon)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-4">
                    {history.length === 0 ? (
                        <div className="text-center text-zinc-500 py-4 flex flex-col items-center">
                            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">No historical data available for this track.</p>
                        </div>
                    ) : (
                        history.map((win) => (
                            <div key={win.year} className="flex items-center gap-4 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors">
                                <div className="text-2xl font-black italic text-zinc-700">{win.year}</div>
                                <div className="flex-1">
                                    <div className="font-bold text-lg">{win.driver}</div>
                                    <div className="text-xs text-zinc-500 uppercase font-mono">{win.team}</div>
                                </div>
                                <div className="text-right">
                                    <Trophy className="w-4 h-4 text-yellow-500 ml-auto mb-1" />
                                    <div className="text-xs font-mono text-zinc-400">{win.time}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
