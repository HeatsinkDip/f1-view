"use client"

import { useEffect, useState, useRef } from "react"
import { TrackPoint } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Zap } from "lucide-react"

interface TrackMapProps {
    data: TrackPoint[];
    circuitName: string;
    currentPosition?: { x: number, y: number };
    comparisonPosition?: { x: number, y: number };
    className?: string;
    showHeatmap?: boolean;
}

export function TrackMap({ data, circuitName, currentPosition, comparisonPosition, className, showHeatmap = true }: TrackMapProps) {
    const [viewBox, setViewBox] = useState("0 0 100 100")

    useEffect(() => {
        if (!data || data.length === 0) return

        // Calculate bounding box
        const xs = data.map(p => p.x)
        const ys = data.map(p => p.y)
        const minX = Math.min(...xs)
        const maxX = Math.max(...xs)
        const minY = Math.min(...ys)
        const maxY = Math.max(...ys)

        const width = maxX - minX
        const height = maxY - minY
        const padding = Math.max(width, height) * 0.1 // Balanced padding

        setViewBox(`${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`)
    }, [data])

    const getSpeedColor = (speed: number) => {
        // Neon Gradient: 
        // Slow (0-100): Blue/Purple
        // Medium (100-250): Cyan/Green
        // Fast (250+): Yellow/Red/White

        if (speed < 100) return "#3b82f6" // Blue
        if (speed < 200) return "#06b6d4" // Cyan
        if (speed < 280) return "#22c55e" // Green
        if (speed < 310) return "#eab308" // Yellow
        return "#ef4444" // Red
    }

    return (
        <Card className={`w-full h-full ${className} bg-zinc-950 border-zinc-900 shadow-2xl overflow-hidden relative group`}>
            {/* Background Grid Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />

            <CardHeader className="absolute top-0 left-0 z-10 p-6">
                <CardTitle className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Live Telemetry</span>
                    <span className="text-2xl font-black uppercase italic tracking-tighter text-white flex items-center gap-2">
                        {circuitName}
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                    </span>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex items-center justify-center h-full min-h-[400px] p-0 relative z-0">
                {data && data.length > 0 ? (
                    <svg
                        viewBox={viewBox}
                        className="w-full h-full p-8"
                        style={{ transform: 'scale(1, -1)' }}
                    >
                        <defs>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="50%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#ef4444" />
                            </linearGradient>
                        </defs>

                        {/* Base Track (Darker, thicker background path) */}
                        <path
                            d={data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                            fill="none"
                            stroke="#18181b"
                            strokeWidth={(parseInt(viewBox.split(' ')[2]) / 100) * 6}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Start/Finish Line Marker */}
                        {data.length > 0 && (
                            <line
                                x1={data[0].x}
                                y1={data[0].y}
                                x2={data[0].x + (parseInt(viewBox.split(' ')[2]) / 100) * 6}
                                y2={data[0].y}
                                stroke="white"
                                strokeWidth={(parseInt(viewBox.split(' ')[2]) / 100) * 2}
                                strokeDasharray="4 4"
                                className="opacity-50"
                            />
                        )}

                        {/* Active Track Path */}
                        {showHeatmap ? (
                            data.map((p, i) => {
                                if (i === 0) return null;
                                const prev = data[i - 1];
                                const color = getSpeedColor(p.speed || 0);
                                return (
                                    <line
                                        key={i}
                                        x1={prev.x}
                                        y1={prev.y}
                                        x2={p.x}
                                        y2={p.y}
                                        stroke={color}
                                        strokeWidth={(parseInt(viewBox.split(' ')[2]) / 100) * 3}
                                        strokeLinecap="round"
                                        className="transition-colors duration-300"
                                        style={{ filter: 'drop-shadow(0 0 4px ' + color + ')' }}
                                    />
                                )
                            })
                        ) : (
                            <path
                                d={data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                                fill="none"
                                stroke="url(#trackGradient)"
                                strokeWidth={(parseInt(viewBox.split(' ')[2]) / 100) * 3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#glow)"
                            />
                        )}

                        {/* Comparison Driver (Ghost Car) */}
                        {comparisonPosition && (
                            <g style={{ transition: 'all 0.1s linear', transform: `translate(${comparisonPosition.x}px, ${comparisonPosition.y}px)` }}>
                                <circle
                                    r={(parseInt(viewBox.split(' ')[2]) / 100) * 3}
                                    fill="transparent"
                                    stroke="rgba(255, 255, 255, 0.4)"
                                    strokeWidth={(parseInt(viewBox.split(' ')[2]) / 100)}
                                    className="animate-ping absolute"
                                />
                                <circle
                                    r={(parseInt(viewBox.split(' ')[2]) / 100) * 3}
                                    fill="#71717a"
                                    stroke="white"
                                    strokeWidth={(parseInt(viewBox.split(' ')[2]) / 100) * 0.5}
                                    className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                />
                            </g>
                        )}

                        {/* Main Driver (Active Car) */}
                        {currentPosition && (
                            <g style={{ transition: 'all 0.05s linear', transform: `translate(${currentPosition.x}px, ${currentPosition.y}px)` }}>
                                {/* Glow Effect */}
                                <circle
                                    r={(parseInt(viewBox.split(' ')[2]) / 100) * 6}
                                    fill="rgba(239, 68, 68, 0.2)"
                                    className="animate-pulse"
                                />
                                {/* Car Dot */}
                                <circle
                                    r={(parseInt(viewBox.split(' ')[2]) / 100) * 4}
                                    fill="#ef4444"
                                    stroke="white"
                                    strokeWidth={(parseInt(viewBox.split(' ')[2]) / 100)}
                                    className="drop-shadow-[0_0_15px_rgba(239,68,68,1)]"
                                />
                            </g>
                        )}
                    </svg>
                ) : (
                    <div className="flex flex-col items-center gap-4 text-zinc-500">
                        <Activity className="w-12 h-12 opacity-20" />
                        <div className="text-sm font-mono uppercase tracking-widest">Awaiting Telemetry Data</div>
                    </div>
                )}

                {/* Map Legend Overlay */}
                <div className="absolute bottom-6 right-6 bg-zinc-950/90 backdrop-blur border border-zinc-800 p-3 rounded-lg flex flex-col gap-2 text-[10px] font-mono uppercase text-zinc-400">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]" />
                        <span>Low Speed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                        <span>Med Speed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" />
                        <span>High Speed</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
