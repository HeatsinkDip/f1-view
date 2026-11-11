"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Radio, Play, Pause, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getTeamRadio, TeamRadioClip } from "@/lib/api"

interface RadioHighlightsProps {
    year?: number
    location?: string
    sessionType?: string
}

export function RadioHighlights({
    year = new Date().getFullYear(),
    location = "Lusail",
    sessionType = "Race",
}: RadioHighlightsProps) {
    const [radios, setRadios] = useState<TeamRadioClip[]>([])
    const [loading, setLoading] = useState(true)
    const [playingUrl, setPlayingUrl] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        let active = true
        setLoading(true)
        getTeamRadio(year, location, sessionType)
            .then((data) => {
                if (active) setRadios(data.radios || [])
            })
            .catch(() => {
                if (active) setRadios([])
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
            setPlayingUrl(null)
        }
    }, [year, location, sessionType])

    const togglePlay = (url: string) => {
        if (!url.startsWith("https://")) {
            return
        }
        if (playingUrl === url && audioRef.current) {
            audioRef.current.pause()
            setPlayingUrl(null)
            return
        }
        if (audioRef.current) {
            audioRef.current.pause()
        }
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => setPlayingUrl(null)
        audio.onerror = () => setPlayingUrl(null)
        audio.play().catch(() => setPlayingUrl(null))
        setPlayingUrl(url)
    }

    return (
        <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-border/60 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Radio className="w-5 h-5 text-red-600 dark:text-red-500" />
                    Team Radio
                </CardTitle>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">{location}</span>
            </CardHeader>
            <CardContent className="p-0 max-h-[340px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-6 text-xs font-mono text-muted-foreground animate-pulse">Fetching pit-wall audio...</div>
                ) : radios.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
                        <Volume2 className="w-6 h-6 opacity-40" />
                        <span>No radio clips archived for {location} {sessionType}.</span>
                    </div>
                ) : (
                    <div className="divide-y divide-border/60">
                        {radios.slice(0, 6).map((radio, idx) => {
                            const isPlaying = playingUrl === radio.recording_url
                            const colorHex = `#${(radio.color || "FF1801").replace(/^#/, "")}`
                            return (
                                <div key={`${radio.recording_url}-${idx}`} className="p-4 hover:bg-accent/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2 h-2 rounded-full shrink-0 border border-border/50"
                                                style={{ backgroundColor: colorHex }}
                                            />
                                            <div className="font-bold text-sm text-foreground">{radio.driver_name || radio.driver_code}</div>
                                            <div className="text-xs text-muted-foreground uppercase font-mono">{radio.team}</div>
                                        </div>
                                        <div className="text-xs font-mono text-muted-foreground">{radio.time} UTC</div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => togglePlay(radio.recording_url)}
                                        className={`w-full text-xs h-8 ${
                                            isPlaying
                                                ? "bg-red-600/15 text-red-600 dark:text-red-400 hover:bg-red-600/25"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                        }`}
                                    >
                                        {isPlaying ? (
                                            <>
                                                <Pause className="w-3 h-3 mr-2" /> Pause Audio
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-3 h-3 mr-2" /> Play Pit-Wall Audio
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
