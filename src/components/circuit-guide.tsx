"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Layers, Zap } from "lucide-react"
import { getTrackData, getCircuitInfo, TrackPoint, CircuitInfoResponse } from "@/lib/api"
import { Toggle } from "@/components/ui/toggle"

interface CircuitGuideProps {
    year?: number
    location?: string
    sessionType?: string
}

export function CircuitGuide({
    year = new Date().getFullYear(),
    location = "Lusail",
    sessionType = "Race",
}: CircuitGuideProps) {
    const [trackData, setTrackData] = useState<TrackPoint[]>([])
    const [circuitInfo, setCircuitInfo] = useState<CircuitInfoResponse | null>(null)
    const [loading, setLoading] = useState(true)

    const [showSectors, setShowSectors] = useState(false)
    const [showDRS, setShowDRS] = useState(true)

    useEffect(() => {
        let active = true
        setLoading(true)
        Promise.all([
            getTrackData(year, location, sessionType).catch(() => ({ circuit_name: location, track_data: [] })),
            getCircuitInfo(year, location, sessionType).catch(() => null),
        ])
            .then(([track, info]) => {
                if (!active) return
                setTrackData(track.track_data || [])
                setCircuitInfo(info)
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [year, location, sessionType])

    if (loading) {
        return (
            <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-border/60 pb-4">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg text-muted-foreground">
                        Loading Circuit...
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[200px]" />
            </Card>
        )
    }

    let pathD = ""
    let points: { x: number; y: number }[] = []

    if (trackData.length > 1) {
        const xs = trackData.map((p) => p.x)
        const ys = trackData.map((p) => p.y)
        const minX = Math.min(...xs)
        const maxX = Math.max(...xs)
        const minY = Math.min(...ys)
        const maxY = Math.max(...ys)

        const width = 500
        const height = 300
        const padding = 40
        const spanX = maxX - minX || 1
        const spanY = maxY - minY || 1

        const scaleX = (width - padding * 2) / spanX
        const scaleY = (height - padding * 2) / spanY
        const scale = Math.min(scaleX, scaleY)
        const offsetX = (width - spanX * scale) / 2
        const offsetY = (height - spanY * scale) / 2

        points = trackData.map((p) => ({
            x: (p.x - minX) * scale + offsetX,
            y: height - ((p.y - minY) * scale + offsetY),
        }))

        pathD = "M " + points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")
    }

    const sector1End = Math.floor(points.length / 3)
    const sector2End = Math.floor((points.length * 2) / 3)

    const pathS1 = points.length > 2 ? "M " + points.slice(0, sector1End).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ") : ""
    const pathS2 = points.length > 2 ? "M " + points.slice(sector1End, sector2End).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ") : ""
    const pathS3 = points.length > 2 ? "M " + points.slice(sector2End).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ") : ""

    const formattedLength =
        typeof circuitInfo?.length_km === "number" && circuitInfo.length_km > 0
            ? `${circuitInfo.length_km.toFixed(3)} km`
            : "--"

    return (
        <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full flex flex-col">
            <CardHeader className="border-b border-border/60 pb-4">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                        <MapPin className="w-5 h-5 text-red-600" />
                        Circuit Guide
                    </CardTitle>
                    <div className="flex gap-1.5">
                        <Toggle
                            pressed={showSectors}
                            onPressedChange={setShowSectors}
                            className="data-[state=on]:bg-red-600/15 data-[state=on]:text-red-600 dark:data-[state=on]:text-red-400 border border-transparent data-[state=on]:border-red-600/40 h-7 px-2"
                        >
                            <Layers className="w-3 h-3 mr-1" />
                            <span className="text-[10px] font-bold">SECTORS</span>
                        </Toggle>
                        <Toggle
                            pressed={showDRS}
                            onPressedChange={setShowDRS}
                            className="data-[state=on]:bg-emerald-600/15 data-[state=on]:text-emerald-700 dark:data-[state=on]:text-green-400 border border-transparent data-[state=on]:border-emerald-600/40 h-7 px-2"
                        >
                            <Zap className="w-3 h-3 mr-1" />
                            <span className="text-[10px] font-bold">FAST</span>
                        </Toggle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex-1 min-h-[220px] bg-muted/50 dark:bg-zinc-950/50 rounded-lg border border-border flex items-center justify-center relative overflow-hidden mb-5">
                    {trackData.length > 1 ? (
                        <svg viewBox="0 0 500 300" className="w-full h-full p-4 text-zinc-900 dark:text-white filter dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                            <path d={pathD} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="opacity-15" />

                            {showSectors ? (
                                <>
                                    <path d={pathS1} fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d={pathS2} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d={pathS3} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </>
                            ) : (
                                <path d={pathD} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            )}

                            {showDRS && points.length > 10 && (
                                <>
                                    <circle cx={points[Math.floor(points.length * 0.08)].x} cy={points[Math.floor(points.length * 0.08)].y} r="4" fill="#16a34a" className="animate-pulse" />
                                    <circle cx={points[Math.floor(points.length * 0.52)].x} cy={points[Math.floor(points.length * 0.52)].y} r="4" fill="#16a34a" className="animate-pulse" />
                                </>
                            )}

                            {points.length > 0 && (
                                <circle cx={points[0].x} cy={points[0].y} r="4" fill="#ef4444" stroke="currentColor" strokeWidth="1.5" />
                            )}
                        </svg>
                    ) : (
                        <div className="text-muted-foreground text-xs font-mono uppercase">Track layout loading soon</div>
                    )}

                    <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur px-2.5 py-1 rounded border border-border text-[10px] font-mono text-foreground flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                        {sessionType.toUpperCase()}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase font-mono">Location</div>
                        <div className="text-lg font-bold text-foreground truncate">{circuitInfo?.location || location}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase font-mono">Country</div>
                        <div className="text-lg font-bold text-foreground truncate">{circuitInfo?.country || "--"}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase font-mono">Length</div>
                        <div className="text-lg font-bold text-foreground">{formattedLength}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase font-mono">Corners</div>
                        <div className="text-lg font-bold text-foreground">
                            {circuitInfo?.corners_count ? `${circuitInfo.corners_count} Turns` : "--"}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
