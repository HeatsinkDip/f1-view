"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Trophy, AlertCircle } from "lucide-react"
import { getHistory, HistoryEntry } from "@/lib/api"

interface HistoryExplorerProps {
    location?: string
    availableLocations?: string[]
}

export function HistoryExplorer({ location = "Lusail", availableLocations }: HistoryExplorerProps) {
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLocation, setSelectedLocation] = useState(location)

    useEffect(() => {
        setSelectedLocation(location)
    }, [location])

    useEffect(() => {
        let active = true
        setLoading(true)
        getHistory(selectedLocation)
            .then((data) => {
                if (active) setHistory(data.history || [])
            })
            .catch(() => {
                if (active) setHistory([])
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [selectedLocation])

    const locationOptions = availableLocations && availableLocations.length > 0
        ? Array.from(new Set([selectedLocation, ...availableLocations]))
        : [selectedLocation]

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
                <div className="mb-5">
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger className="bg-zinc-950 border-zinc-800">
                            <SelectValue placeholder="Select Circuit" />
                        </SelectTrigger>
                        <SelectContent>
                            {locationOptions.map((loc) => (
                                <SelectItem key={loc} value={loc}>
                                    {loc} GP Winners
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    {history.length === 0 ? (
                        <div className="text-center text-zinc-500 py-6 flex flex-col items-center">
                            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">No historical data available for {selectedLocation}.</p>
                        </div>
                    ) : (
                        history.map((win) => (
                            <div
                                key={`${win.year}-${win.driver}`}
                                className="flex items-center gap-4 p-3.5 bg-zinc-950/50 rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors"
                            >
                                <div className="text-xl font-black italic text-zinc-600">{win.year}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-base truncate">{win.driver}</div>
                                    <div className="text-xs text-zinc-500 uppercase font-mono truncate">{win.team}</div>
                                </div>
                                <div className="text-right shrink-0">
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
