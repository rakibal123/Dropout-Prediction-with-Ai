"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
    min: number;
    max: number;
    step?: number;
    value: number;
    onChange: (value: number) => void;
    label?: string;
    unit?: string;
    className?: string;
}

export function Slider({
    min,
    max,
    step = 1,
    value,
    onChange,
    label,
    unit = "%",
    className
}: SliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={cn("space-y-3 w-full", className)}>
            <div className="flex items-center justify-between">
                {label && <label className="text-sm font-semibold text-slate-300">{label}</label>}
                <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {value}{unit}
                </span>
            </div>
            <div className="relative h-6 flex items-center group">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary group-hover:bg-slate-700 transition-colors"
                />
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-primary rounded-full pointer-events-none"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
