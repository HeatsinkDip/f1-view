"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TelemetryPoint } from "@/lib/api"

interface TelemetryHUDProps {
    data?: TelemetryPoint;
}

export function TelemetryHUD({ data }: TelemetryHUDProps) {
    // Default values if data is missing
    const speed = data?.speed || 0;
    const rpm = data?.rpm || 0;
    const gear = data?.gear || 0;
    const throttle = data?.throttle || 0;
    const brake = data?.brake || 0;

    // RPM Max (approximate for F1)
    const maxRpm = 12000;
    const rpmPercentage = Math.min(100, (rpm / maxRpm) * 100);

    // Gear display logic
    const getGearDisplay = (g: number) => {
        if (g === 0) return "N";
        if (g === 8) return "8"; // 8th gear
        return g.toString();
    }

    return (
        <Card className="w-full bg-card/95 backdrop-blur-md border-border text-foreground shadow-xl dark:shadow-2xl overflow-hidden">
            <CardHeader className="pb-2 border-b border-border bg-muted/60 dark:bg-zinc-900/50">
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Telemetry HUD</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4">
                    {/* Left: Throttle & Brake */}
                    <div className="flex justify-center gap-2 h-32">
                        {/* Brake */}
                        <div className="flex flex-col items-center gap-1 w-8">
                            <div className="relative w-full h-full bg-muted rounded-sm overflow-hidden border border-border">
                                <div
                                    className="absolute bottom-0 left-0 w-full bg-red-600 transition-all duration-75 ease-out"
                                    style={{ height: `${brake}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">Brk</span>
                        </div>
                        {/* Throttle */}
                        <div className="flex flex-col items-center gap-1 w-8">
                            <div className="relative w-full h-full bg-muted rounded-sm overflow-hidden border border-border">
                                <div
                                    className="absolute bottom-0 left-0 w-full bg-green-500 transition-all duration-75 ease-out"
                                    style={{ height: `${throttle}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">Thr</span>
                        </div>
                    </div>

                    {/* Center: Gear & Speed */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative flex items-center justify-center w-24 h-24 bg-muted/80 dark:bg-zinc-900 rounded-full border-4 border-border shadow-inner">
                            <span className="text-6xl font-black tracking-tighter text-foreground">
                                {getGearDisplay(gear)}
                            </span>
                            <div className="absolute -bottom-2 px-2 py-0.5 bg-card border border-border rounded text-[10px] font-mono text-muted-foreground">
                                GEAR
                            </div>
                        </div>
                        <div className="mt-2 text-center">
                            <div className="text-4xl font-bold font-mono tabular-nums leading-none text-foreground">
                                {Math.round(speed)}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground uppercase">km/h</div>
                        </div>
                    </div>

                    {/* Right: RPM & DRS (Placeholder) */}
                    <div className="flex flex-col justify-between h-32 py-1">
                        <div className="flex flex-col gap-1 h-full">
                            <div className="flex justify-between items-end text-[10px] font-mono text-muted-foreground mb-1">
                                <span>RPM</span>
                                <span>{rpm}</span>
                            </div>
                            <div className="w-full flex-1 bg-muted rounded-sm overflow-hidden border border-border relative">
                                {/* RPM Gradient Bar */}
                                <div
                                    className="absolute bottom-0 left-0 w-full transition-all duration-75 ease-out"
                                    style={{
                                        height: `${rpmPercentage}%`,
                                        background: `linear-gradient(to top, 
                                            #3b82f6 0%, 
                                            #22c55e 60%, 
                                            #ef4444 90%
                                        )`
                                    }}
                                />
                                {/* Redline Marker */}
                                <div className="absolute top-[10%] left-0 w-full h-[1px] bg-foreground/25" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
