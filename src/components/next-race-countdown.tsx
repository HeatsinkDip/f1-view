"use client"

import { useEffect, useState } from "react"

interface NextRaceCountdownProps {
    targetDate: string | Date
}

export function NextRaceCountdown({ targetDate }: NextRaceCountdownProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date()

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                })
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            }
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [targetDate])

    return (
        <div className="flex gap-4 justify-center">
            <div className="flex flex-col items-center bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl min-w-[80px] backdrop-blur-sm">
                <span className="text-4xl font-black text-white font-mono">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Days</span>
            </div>
            <div className="flex flex-col items-center bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl min-w-[80px] backdrop-blur-sm">
                <span className="text-4xl font-black text-white font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Hrs</span>
            </div>
            <div className="flex flex-col items-center bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl min-w-[80px] backdrop-blur-sm">
                <span className="text-4xl font-black text-white font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Mins</span>
            </div>
            <div className="flex flex-col items-center bg-red-600/90 border border-red-500 p-4 rounded-xl min-w-[80px] backdrop-blur-sm shadow-[0_0_15px_rgba(220,38,38,0.4)] animate-pulse">
                <span className="text-4xl font-black text-white font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase tracking-widest text-white/80 mt-1">Secs</span>
            </div>
        </div>
    )
}
