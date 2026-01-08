import React from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 500 },
  { name: 'Apr', value: 280 },
  { name: 'May', value: 590 },
  { name: 'Jun', value: 320 },
  { name: 'Jul', value: 800 },
];

export function StatsCard() {
  return (
    <div className="relative h-full w-full flex flex-col justify-between p-6">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-neutral-200">Safe & Secure Transaction</h3>
                <p className="text-sm text-neutral-400">End-to-End Encryption</p>
            </div>
            <div className="text-right">
                <div className="text-2xl font-bold text-emerald-400">100%</div>
                <div className="text-xs text-neutral-400">Verified</div>
            </div>
        </div>
        
        <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
}
