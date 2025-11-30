"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FantasyTeam() {
    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Users className="w-5 h-5 text-purple-500" />
                    Fantasy Team
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-sm text-zinc-400">Budget Remaining</div>
                    <div className="text-xl font-bold text-green-500">$12.5M</div>
                </div>

                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((slot) => (
                        <div key={slot} className="h-12 border border-dashed border-zinc-700 rounded-lg flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 transition-all cursor-pointer group">
                            <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-mono uppercase">Select Driver {slot}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <div className="text-xs text-zinc-500 uppercase font-mono mb-2">Constructor</div>
                    <div className="h-12 border border-dashed border-zinc-700 rounded-lg flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 transition-all cursor-pointer group">
                        <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-mono uppercase">Select Team</span>
                    </div>
                </div>

                <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider">
                    Save Team
                </Button>
            </CardContent>
        </Card>
    )
}
