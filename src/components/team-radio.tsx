"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Radio, Play, Pause, Volume2 } from "lucide-react"
import { getTeamRadio, TeamRadioClip } from "@/lib/api"

interface TeamRadioProps {
    year?: number
    location?: string
    sessionType?: string
    driverCode?: string
}

export function TeamRadio({ year = 2025, location = "Lusail", sessionType = "Race", driverCode }: TeamRadioProps) {
    const queryKey = `${year}|${location}|${sessionType}`
    const [clips, setClips] = useState<TeamRadioClip[]>([])
    const [loadedKey, setLoadedKey] = useState<string>("")
    const [playingUrl, setPlayingUrl] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const loading = loadedKey !== queryKey

    useEffect(() => {
        let active = true
        getTeamRadio(year, location, sessionType)
            .then((data) => {
                if (!active) return
                setClips(data.radios || [])
            })
            .catch(() => {
                if (active) setClips([])
            })
            .finally(() => {
                if (active) {
                    setLoadedKey(queryKey)
                    setPlayingUrl(null)
                }
            })
        return () => {
            active = false
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [year, location, sessionType, queryKey])

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

    const sortedClips = [...clips].sort((a, b) => {
        if (!driverCode) return 0
        if (a.driver_code === driverCode && b.driver_code !== driverCode) return -1
        if (b.driver_code === driverCode && a.driver_code !== driverCode) return 1
        return 0
    })

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 h-full flex flex-col overflow-hidden group hover:border-zinc-700 transition-colors">
            <CardHeader className="py-3 px-4 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm flex flex-row items-center justify-between sticky top-0 z-10">
                <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                    <Radio className={`w-3 h-3 text-red-500 ${playingUrl ? "animate-pulse" : ""}`} />
                    Team Radio {clips.length > 0 && `(${clips.length})`}
                </CardTitle>
                <div className="flex gap-1">
                    <span className={`w-0.5 h-2 bg-red-500 ${playingUrl ? "animate-pulse" : "opacity-40"}`} />
                    <span className={`w-0.5 h-3 bg-red-500 ${playingUrl ? "animate-pulse" : "opacity-40"}`} />
                    <span className={`w-0.5 h-2 bg-red-500 ${playingUrl ? "animate-pulse" : "opacity-40"}`} />
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar bg-zinc-950/30">
                {loading ? (
                    <div className="p-4 text-xs font-mono text-zinc-500 animate-pulse">Loading radio channels...</div>
                ) : sortedClips.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
                        <Volume2 className="w-5 h-5 opacity-40" />
                        <span>No FIA team radio clips archived for this session.</span>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {sortedClips.slice(0, 15).map((clip, i) => {
                            const isPlaying = playingUrl === clip.recording_url
                            const colorHex = `#${(clip.color || "FF1801").replace(/^#/, "")}`
                            const isSelectedDriver = driverCode && clip.driver_code === driverCode
                            return (
                                <button
                                    key={`${clip.recording_url}-${i}`}
                                    type="button"
                                    onClick={() => togglePlay(clip.recording_url)}
                                    className={`w-full text-left p-3.5 border-b border-zinc-800/30 hover:bg-zinc-900/60 transition-all relative overflow-hidden flex items-center justify-between gap-3 ${
                                        isPlaying ? "bg-red-500/10" : isSelectedDriver ? "bg-zinc-900/40" : ""
                                    }`}
                                >
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-1"
                                        style={{ backgroundColor: colorHex }}
                                    />
                                    <div className="pl-2.5 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black text-sm tracking-tight text-white">
                                                {clip.driver_code}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-zinc-800 text-zinc-300 truncate max-w-[120px]">
                                                {clip.team}
                                            </span>
                                            {isSelectedDriver && (
                                                <span className="text-[9px] font-mono uppercase text-red-400 border border-red-500/30 px-1 rounded">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] font-mono text-zinc-400 truncate">
                                            {clip.driver_name} · {clip.time} UTC
                                        </div>
                                    </div>
                                    <span className="shrink-0 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
                                        {isPlaying ? <Pause className="w-3.5 h-3.5 text-red-500" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
