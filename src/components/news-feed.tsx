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
        <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Newspaper className="w-5 h-5 text-muted-foreground" />
                    {year} Race Briefing
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {recentAndUpcoming.length === 0 ? (
                    <div className="p-6 text-xs text-muted-foreground">No events scheduled.</div>
                ) : (
                    <div className="divide-y divide-border/60">
                        {recentAndUpcoming.map((ev) => {
                            const dateStr = ev.Session5DateUtc || ev.Session5Date || ev.EventDate
                            const raceDate = new Date(dateStr)
                            const isPast = raceDate <= now
                            return (
                                <Link
                                    key={`${ev.RoundNumber}-${ev.Location}`}
                                    href={`/session/${year}/${encodeURIComponent(ev.Location)}/Race`}
                                    className="block p-4 hover:bg-accent/50 transition-colors group"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-bold text-sm text-foreground group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2 mb-1">
                                            R{ev.RoundNumber}: {ev.EventName || ev.OfficialEventName}
                                        </h4>
                                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground flex-shrink-0 mt-0.5" />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                        <span className={isPast ? "text-emerald-700 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"}>
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
