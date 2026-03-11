import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request:Request) {
    try{
        const body = await request.json();

        const insertData = {
            device_id: body.device_id || "ESP32_PlantGuard_01",
            moisture: Number(body.soil) || 0,
            temperature: Number(body.temperature) || 0,
            light_lux: Number(body.light_lux) || 0,
        };

        const { data, error } = await supabase
            .from("sensor_readings")
            .insert(insertData)
            .select()
            .single()

        if(error){
            console.error("Supabase error:", error);
            throw error;
        }

        return NextResponse.json({ success: true, data });

    } catch(error){
        console.error("Error:", error);

        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}