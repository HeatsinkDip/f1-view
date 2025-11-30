"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Newspaper, ExternalLink } from "lucide-react"
import Link from "next/link"

const NEWS = [
    { title: "Verstappen hints at early retirement again", source: "F1.com", time: "2h ago" },
    { title: "Newey confirms move to Aston Martin", source: "Autosport", time: "4h ago" },
    { title: "Wolff: 'Mercedes 2025 car is a revolution'", source: "Sky Sports", time: "6h ago" },
    { title: "Audi takeover of Sauber complete", source: "Motorsport.com", time: "1d ago" },
]

export function NewsFeed() {
    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Newspaper className="w-5 h-5 text-zinc-400" />
                    Latest News
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-zinc-800/50">
                    {NEWS.map((item, idx) => (
                        <Link key={idx} href="#" className="block p-4 hover:bg-zinc-800/30 transition-colors group">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-sm group-hover:text-red-500 transition-colors line-clamp-2 mb-1">
                                    {item.title}
                                </h4>
                                <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 flex-shrink-0 mt-1" />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                                <span>{item.source}</span>
                                <span>•</span>
                                <span>{item.time}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
