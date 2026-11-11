"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStandings, DriverStanding, ConstructorStanding } from "@/lib/api"

interface FantasyTeamProps {
    year?: number
}

const TOTAL_BUDGET = 100.0

function driverPrice(points: number, pos: number): number {
    const raw = Math.max(6.0, 28.0 - (pos - 1) * 1.1 + points * 0.01)
    return Number(Math.min(32.0, raw).toFixed(1))
}

function constructorPrice(pos: number): number {
    return Number(Math.max(8.0, 30.0 - (pos - 1) * 2.0).toFixed(1))
}

export function FantasyTeam({ year = new Date().getFullYear() }: FantasyTeamProps) {
    const [drivers, setDrivers] = useState<DriverStanding[]>([])
    const [constructors, setConstructors] = useState<ConstructorStanding[]>([])
    const [selectedDrivers, setSelectedDrivers] = useState<string[]>(["", "", "", "", ""])
    const [selectedConstructor, setSelectedConstructor] = useState<string>("")
    const [saved, setSaved] = useState(false)

    const storageKey = `f1view_fantasy_${year}`

    useEffect(() => {
        let active = true
        setSaved(false)
        try {
            const raw = localStorage.getItem(storageKey)
            if (raw) {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed.drivers) && parsed.drivers.length === 5) {
                    setSelectedDrivers(parsed.drivers)
                }
                if (typeof parsed.constructor === "string") {
                    setSelectedConstructor(parsed.constructor)
                }
            } else {
                setSelectedDrivers(["", "", "", "", ""])
                setSelectedConstructor("")
            }
        } catch {
            // Ignore malformed local storage
        }

        getStandings(year)
            .then((data) => {
                if (!active) return
                setDrivers(data.drivers || [])
                setConstructors(data.constructors || [])
            })
            .catch(() => {
                if (active) {
                    setDrivers([])
                    setConstructors([])
                }
            })
        return () => { active = false }
    }, [year, storageKey])

    const spentDrivers = selectedDrivers.reduce((sum, code) => {
        const found = drivers.find((d) => d.code === code)
        return sum + (found ? driverPrice(found.points, found.pos) : 0)
    }, 0)

    const chosenTeam = constructors.find((c) => c.name === selectedConstructor)
    const spentTeam = chosenTeam ? constructorPrice(chosenTeam.pos) : 0
    const remaining = TOTAL_BUDGET - spentDrivers - spentTeam

    const totalPoints =
        selectedDrivers.reduce((sum, code) => {
            const found = drivers.find((d) => d.code === code)
            return sum + (found?.points || 0)
        }, 0) + (chosenTeam?.points || 0)

    const handleSave = () => {
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify({ drivers: selectedDrivers, constructor: selectedConstructor })
            )
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
        } catch {
            // Ignore quota errors
        }
    }

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-zinc-800/50 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Users className="w-5 h-5 text-purple-500" />
                    Fantasy Team
                </CardTitle>
                <span className="text-xs font-mono text-zinc-400">{totalPoints} PTS</span>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-zinc-400">Budget Remaining</div>
                    <div className={`text-xl font-bold ${remaining < 0 ? "text-red-500" : "text-green-500"}`}>
                        ${remaining.toFixed(1)}M
                    </div>
                </div>

                <div className="space-y-2.5">
                    {selectedDrivers.map((val, slotIdx) => (
                        <Select
                            key={slotIdx}
                            value={val || "empty"}
                            onValueChange={(nextVal) => {
                                const updated = [...selectedDrivers]
                                updated[slotIdx] = nextVal === "empty" ? "" : nextVal
                                setSelectedDrivers(updated)
                                setSaved(false)
                            }}
                        >
                            <SelectTrigger className="h-10 bg-zinc-950/60 border-zinc-800 text-xs font-mono">
                                <SelectValue placeholder={`Select Driver ${slotIdx + 1}`} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="empty">Empty Driver Slot {slotIdx + 1}</SelectItem>
                                {drivers.map((d) => {
                                    const takenElsewhere = selectedDrivers.some((code, i) => i !== slotIdx && code === d.code)
                                    return (
                                        <SelectItem key={d.driverId || d.code} value={d.code} disabled={takenElsewhere}>
                                            {d.code} · {d.name} (${driverPrice(d.points, d.pos)}M)
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    ))}
                </div>

                <div className="mt-4">
                    <div className="text-xs text-zinc-500 uppercase font-mono mb-1.5">Constructor</div>
                    <Select
                        value={selectedConstructor || "empty"}
                        onValueChange={(nextVal) => {
                            setSelectedConstructor(nextVal === "empty" ? "" : nextVal)
                            setSaved(false)
                        }}
                    >
                        <SelectTrigger className="h-10 bg-zinc-950/60 border-zinc-800 text-xs font-mono">
                            <SelectValue placeholder="Select Constructor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="empty">Select Constructor</SelectItem>
                            {constructors.map((c) => (
                                <SelectItem key={c.name} value={c.name}>
                                    {c.name} (${constructorPrice(c.pos)}M)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    type="button"
                    onClick={handleSave}
                    disabled={remaining < 0}
                    className="w-full mt-5 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider"
                >
                    {saved ? (
                        <>
                            <Check className="w-4 h-4 mr-2" /> Team Saved
                        </>
                    ) : remaining < 0 ? (
                        "Over Budget"
                    ) : (
                        "Save Team"
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
