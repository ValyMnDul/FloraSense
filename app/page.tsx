"use client"

import React from "react";
import { useEffect, useState, useCallback, useMemo } from "react"
import { supabase, SensorReading } from "@/lib/supabase";

type TimeRange = "1h" | "6h" | "24h" | "7d" | "30d";

export default function Dashboard(){

  const [data, setData] = useState<SensorReading[]>([]);
  const [latest, setLatest] = useState<SensorReading | null> (null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("6h");
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [stats, setStats] = useState({
    moistureAvg: 0,
    moistureTrend: 0,
    tempAvg: 0,
    tempTrend: 0,
    lightAvg: 0,
    lightTrend: 0,
    totalReadings: 0,
    moistureMin: 0,
    moistureMax: 0,
    tempMin: 0,
    tempMax: 0,
    lightMin: 0,
    lightMax: 0,
  });

  const calculateStats = useCallback((readings: SensorReading[])=>{
    if(readings.length < 2) return;

    const moistureValues = readings.map((r) => r.moisture);
    const tempValues = readings.map((r) => r.temperature);
    const lightValues = readings.map((r) => r.light_lux);

    const moistureAvg = moistureValues.reduce((a,b) => a + b, 0) / moistureValues.length;
    const tempAvg = tempValues.reduce((a,b) => a + b, 0) / tempValues.length;
    const lightAvg = lightValues.reduce((a, b) => a + b, 0) / lightValues.length;

    const recentMoisture = moistureValues.slice(-10);
    const oldMoisture = moistureValues.slice(-20,-10);
    const moistureTrend = (recentMoisture.reduce((a, b) => a + b, 0) || 0) - (oldMoisture.reduce((a, b) => a + b, 0 || 0));

    const recentTemp = tempValues.slice(-10);
    const oldTemp = tempValues.slice(-20, -10);
    const tempTrend = (recentTemp.reduce((a, b) => a + b, 0) || 0) - (oldTemp.reduce((a, b) => a + b, 0) || 0);

    const recentLight = lightValues.slice(-10);
    const oldLight = lightValues.slice(-20, -10);
    const lightTrend = (recentLight.reduce((a, b) => a + b, 0) || 0) - (oldLight.reduce((a, b) => a + b, 0) || 0);

    setStats({
      moistureAvg,
      moistureTrend,
      tempAvg,
      tempTrend,
      lightAvg,
      lightTrend,
      totalReadings: readings.length,
      moistureMin: Math.min(...moistureValues),
      moistureMax: Math.max(...moistureValues),
      tempMin: Math.min(...tempValues),
      tempMax: Math.max(...tempValues),
      lightMin: Math.min(...lightValues),
      lightMax: Math.max(...lightValues)
    });

  },[])
  
  return <h1>HI</h1> 
}