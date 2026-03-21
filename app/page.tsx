"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { supabase, SensorReading } from "@/lib/supabase";
import { Download, Settings, Droplets, Thermometer, Sun, Clock, Activity } from 'lucide-react';
import { format, subHours, subDays } from "date-fns";
import StartCard from "@/components/StartCard";
import Loading from "@/components/Loading";
import ChartCard from "@/components/ChartCard";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, Legend } from "recharts";
import SettingsModal from "@/components/SettingsModal";

type TimeRange = "1h" | "6h" | "24h" | "7d" | "30d";

export default function Dashboard(){

  const [data, setData] = useState<SensorReading[]>([]);
  const [latest, setLatest] = useState<SensorReading | null> (null);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
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
    const moistureTrend = (recentMoisture.reduce((a, b) => a + b, 0) || 0) - (oldMoisture.reduce((a, b) => a + b, 0) || 0);

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

  const fetchData = useCallback(async () => {
    setLoading(true);

    const now = new Date();
    let fromDate: Date;

    switch (timeRange){
      case "1h":
        fromDate = subHours(now, 1);
        break;

      case "6h": 
        fromDate = subHours(now, 6);
        break;

      case "24h":
        fromDate = subHours(now, 24);
        break;

      case "7d":
        fromDate = subDays(now, 7);
        break;

      case "30d":
        fromDate = subDays(now,30);
        break;
    }

    const {data: readings, error} = await supabase
      .from("sensor_readings")
      .select("*")
      .gte("created_at", fromDate.toISOString())
      .order("created_at", {ascending:true});

    if(!error && readings){
      setData(readings);

      if(readings.length > 0){
        const last = readings[readings.length - 1];
        setLatest(last);
        calculateStats(readings);
      } else {
        setLatest(null);
      }
    }

    setLoading(false);
  }, [timeRange, calculateStats]);

  const isInRange = useCallback((createdAt: string) => {
    const t = new Date(createdAt).getTime();
    const now = Date.now();

    let from = now;

    if (timeRange === "1h") from -= 1 * 60 * 60 * 1000;
    if (timeRange === "6h") from -= 6 * 60 * 60 * 1000;
    if (timeRange === "24h") from -= 24 * 60 * 60 * 1000;
    if (timeRange === "7d") from -= 7 * 24 * 60 * 60 * 1000;
    if (timeRange === "30d") from -= 30 * 24 * 60 * 60 * 1000;

    return t >= from;
  }, [timeRange]);

  useEffect(() => {
    const subscription = supabase
      .channel("sensor_readings")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sensor_readings" }, (payload) => {
        const newReading = payload.new as SensorReading;
        setLatest(newReading);

        if (!isInRange(newReading.created_at)) return;

        setData((prev) => {
          const next = [...prev, newReading].slice(-1000);
          calculateStats(next);
          return next;
        });
      })
      .subscribe();

      return () => {
        subscription.unsubscribe();
      }
      
  }, [calculateStats, isInRange]);

  useEffect(() => {
    let isMounted = true;
    const id = globalThis.setTimeout(() => {
      if(isMounted) fetchData();
    },0);

    return () => {
      isMounted = false;
      clearTimeout(id);
    }
  }, [fetchData]);


  const exportData = useCallback(() => {
    const csv = [
       "Timestamp,Device ID,Moisture %,Temperature °C,Light lux",
       ...data.map((r) => `${r.created_at},${r.device_id},${r.moisture},${r.temperature},${r.light_lux}`)
    ].join('\n');

    const blob = new Blob([csv],{type:"text/csv"});
    const URL = globalThis.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = URL;
    a.download = `evasoil-export-${Date.now()}.csv`;
    a.click();
    globalThis.setTimeout(() => globalThis.URL.revokeObjectURL(URL), 50);
  }, [data]);

  const getStatusColor = useCallback((value: number, type: "moisture" | "temp" | "light") => {
    if(type === "moisture"){
      if(value > 60) return "text-green-500";
      if(value > 40) return "text-blue-500";
      if(value > 20) return "text-orange-500";
      return "text-red-500";
    }
    
    if(type === "temp"){
      if(value > 28) return "text-red-500";
      if(value > 22) return "text-green-500";
      if(value > 15) return "text-blue-500";
      return "text-cyan-500";
    }

    if(type === "light"){
      if(value > 1000) return "text-yellow-500";
      if(value > 500) return "text-orange-500";
      if(value > 200) return "text-blue-500";
      return "text-gray-500";
    }
  }, []);

  const timeLabelFormat = useMemo(() => {
    if(timeRange === "7d") return "EEE HH:mm";
    if(timeRange === "30d") return "MMM d";
    return "HH:mm";
  }, [timeRange]);

  const chartData = useMemo(() => {
    return data.map((r) => ({
      time: format(new Date(r.created_at), timeLabelFormat),
      moisture: r.moisture,
      temp: r.temperature,
      light: r.light_lux
    }));
  }, [data, timeLabelFormat]);

  const xAxisAngle = timeRange === "30d" ? 0 : -45;
  const xAxisHeight = timeRange === "30d" ? 40 : 70;

  const clearHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/sensor-data?action=clear_all",{
        method:"DELETE",
      });
      const result = await response.json();

      if (result.success) {
        setData([]);
        setLatest(null);
        alert("History cleared successfully!");
      }
      
    } catch(error){
      alert("Error clearing history");
      console.error(error);
    }
  }, []);
 
  if(loading){
    return <Loading/>
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="max-w-400 mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-green-800 mb-2 font-mono">
                🌱 FloraSense
              </h1>
              <p className="text-gray-600 text-lg">
                Smart Plant Monitoring System
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {
                (["1h", "6h", "24h", "7d", "30d"] as TimeRange[]).map((range)=>(
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      timeRange == range 
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {range.toUpperCase()}
                  </button>
                ))
              }

              <button
              onClick={exportData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2"
              > 
                <Download size={18}/>
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all flex items-center gap-2"
              onClick = {() => setShowSettings(true)}
              > 
                <Settings size={18}/>
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </header>

        {latest &&(
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <StartCard
              icon={<Droplets />}
              title="Soil Moisture"
              value={`${latest.moisture.toFixed(1)}%`}
              color="blue"
              trend={stats.moistureTrend}
              average={stats.moistureAvg}
              min={stats.moistureMin}
              max={stats.moistureMax}
              status={getStatusColor(latest.moisture, "moisture")}
              />

              <StartCard
              icon={<Thermometer/>}
              title="Temperature"
              value={`${latest.temperature.toFixed(1)}°C`}
              color="red"
              trend={stats.tempTrend}
              average={stats.tempAvg}
              min={stats.tempMin}
              max={stats.tempMax}
              status={getStatusColor(latest.temperature, "temp")}
              />

              <StartCard
              icon={<Sun/>}
              title="Light Level"
              value={`${Math.round(latest.light_lux)} lx`}
              color="yellow"
              trend={stats.lightTrend}
              average={stats.lightAvg}
              min={stats.lightMin}
              max={stats.lightMax}
              status={getStatusColor(latest.light_lux, "light")}
              />

              <StartCard
              icon={<Clock />}
              title="Last Update"
              value={format(new Date(latest.created_at), "HH:mm:ss")}
              color="purple"
              subtitle={`${stats.totalReadings} readings`}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              <ChartCard
              title="Soil Moisture"
              icon={<Droplets />}
              >
                <ResponsiveContainer
                width="100%"
                height={300}
                >
                  <AreaChart data={chartData}>

                    <defs>
                      <linearGradient
                      id="colorMoisture"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                      >
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>

                    <XAxis
                      dataKey="time"
                      stroke="#64748b"
                      angle={xAxisAngle}
                      textAnchor={xAxisAngle === 0 ? "middle" : "end"}
                      height={xAxisHeight}
                      interval="preserveStartEnd"
                      style={{ fontSize: "12px" }}
                    />

                    <YAxis 
                      domain={[0, 100]} 
                      stroke="#64748b"
                      style={{ fontSize: "12px" }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="moisture"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#colorMoisture)"
                    />

                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard 
              title="Temperature"
              icon={<Thermometer />}
              >
                <ResponsiveContainer
                width="100%"
                height={300}
                >
                  <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                        id="colorTemp"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                        >
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                      <XAxis
                      dataKey="time"
                      stroke="#64748b"
                      angle={xAxisAngle}
                      textAnchor={xAxisAngle === 0 ? "middle" : "end"}
                      height={xAxisHeight}
                      interval="preserveStartEnd"
                      style={{ fontSize: "12px" }}
                      />

                      <YAxis 
                      stroke="#64748b"
                      style={{ fontSize: "12px" }}
                      />

                      <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }}
                      />

                      <Area
                      type="monotone"
                      dataKey="temp"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#colorTemp)"
                      />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Light Level" icon={<Sun/>}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorLight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>

                      <XAxis
                      dataKey="time"
                      stroke="#64748b"
                      angle={xAxisAngle}
                      textAnchor={xAxisAngle === 0 ? "middle" : "end"}
                      height={xAxisHeight}
                      interval="preserveStartEnd"
                      style={{ fontSize: "12px"}}
                      />

                      <YAxis
                      stroke="#64748b"
                      style={{ fontSize: "12px"}}
                      />

                      <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      />

                      <Area
                      type="monotone"
                      dataKey="light"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#colorLight)"
                      />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title="Combined Analytics Dashboard" icon={<Activity/>}>
              <ResponsiveContainer width="100%" height={450}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>

                  <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  angle={xAxisAngle}
                  textAnchor={xAxisAngle === 0 ? "middle" : "end"}
                  height={xAxisHeight}
                  interval="preserveStartEnd"
                  style={{ fontSize: "12px" }}
                  />

                  <YAxis 
                  yAxisId="left" 
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                  />

                  <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                  />
                  
                  <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  />

                  <Legend />

                  <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="moisture"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Moisture %"
                  dot={false}
                  />

                  <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="temp"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Temperature °C"
                  dot={false}
                  />

                  <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="light"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Light lx"
                  dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="space-y-4">
              {latest.moisture < 30 && (
                <div className="mt-8 bg-linear-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-6 rounded-r-xl shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Droplets className="text-orange-600" size={24}/>
                    </div>
                    <div>
                      <h3 className="font-bold text-orange-900 text-lg mb-1">Low Moisture Alert </h3>
                      <p className="text-orange-800">
                        Your plant needs water! Current level:{" "}
                        <strong>{latest.moisture.toFixed(1)}%</strong>
                      </p>
                      <p className="text-sm text-orange-700 mt-2">
                        Recommended action: Water your plant within the next hour
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {latest.light_lux < 100 && (
                <div className="bg-linear-to-r from-gray-50 to-slate-50 border-l-4 border-gray-500 p-6 rounded-r-xl shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <Sun className="text-gray-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">Low Light Alert</h3>
                      <p className="text-gray-800">
                        Light level is low: <strong>{Math.round(latest.light_lux)} lx</strong>
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        Consider moving your plant to a brighter location
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!latest && !loading && (
                <div className="text-center py-20">
                  <Activity className="w-20 h-20 text-gray-400 mx-auto mb-4"/> 
                  <p className="text-xl text-gray-500">Waiting for sensor data...</p>
                  <p className="text-sm text-gray-400 mt-2">Make sure your ESP32 is connected</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <SettingsModal 
      isOpen={showSettings}
      onClose={() => setShowSettings(false)}
      onClearHistory={clearHistory}
      onExportData={exportData}
      deviceId={latest?.device_id || "Unknown"}
      />
    </div>
  );
}
