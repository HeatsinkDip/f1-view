"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Newspaper, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Event } from "@/lib/api"

interface NewsFeedProps {
    year?: number
    events?: Event[]
}

export function NewsFeed({ year = new Date().getFullYear(), events = [] }: NewsFeedProps) {
    const now = new Date()
    const recentAndUpcoming = events
        .slice()
        .sort((a, b) => Math.abs(new Date(a.EventDate).getTime() - now.getTime()) - Math.abs(new Date(b.EventDate).getTime() - now.getTime()))
        .slice(0, 4)

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Newspaper className="w-5 h-5 text-zinc-400" />
                    {year} Race Briefing
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {recentAndUpcoming.length === 0 ? (
                    <div className="p-6 text-xs text-zinc-500">No events scheduled.</div>
                ) : (
                    <div className="divide-y divide-zinc-800/50">
                        {recentAndUpcoming.map((ev) => {
                            const dateStr = ev.Session5DateUtc || ev.Session5Date || ev.EventDate
                            const raceDate = new Date(dateStr)
                            const isPast = raceDate <= now
                            return (
                                <Link
                                    key={`${ev.RoundNumber}-${ev.Location}`}
                                    href={`/session/${year}/${encodeURIComponent(ev.Location)}/Race`}
                                    className="block p-4 hover:bg-zinc-800/30 transition-colors group"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-bold text-sm group-hover:text-red-500 transition-colors line-clamp-2 mb-1">
                                            R{ev.RoundNumber}: {ev.EventName || ev.OfficialEventName}
                                        </h4>
                                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white flex-shrink-0 mt-0.5" />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                                        <span className={isPast ? "text-green-500" : "text-red-400"}>
                                            {isPast ? "REPLAY READY" : "UPCOMING"}
                                        </span>
                                        <span>·</span>
                                        <span>{ev.Location}, {ev.Country}</span>
                                        <span>·</span>
                                        <span>
                                            {raceDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                        </span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
