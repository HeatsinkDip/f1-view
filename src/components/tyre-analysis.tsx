"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleDashed } from "lucide-react"

export function TyreAnalysis() {
    return (
        <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="py-3 px-4 border-b border-zinc-800">
                <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                    <CircleDashed className="w-3 h-3 text-yellow-500" />
                    Tyre Life
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                        <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#27272a"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="3"
                                    strokeDasharray="75, 100"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">75%</div>
                        </div>
                        <div className="text-xs font-bold text-red-500">SOFT</div>
                        <div className="text-[10px] text-zinc-500">12 Laps Old</div>
                    </div>

                    <div className="space-y-3 w-full max-w-[120px]">
                        <div>
                            <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                                <span>Grip</span>
                                <span>High</span>
                            </div>
                            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full w-[80%] bg-green-500" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                                <span>Temp</span>
                                <span className="text-red-500">Hot</span>
                            </div>
                            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full w-[90%] bg-red-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
