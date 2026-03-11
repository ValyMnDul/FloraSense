import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request:Request) {
    try{
        const body = await request.json();

        const insertData = {
            device_id: body.device_id || "ESP32_PlantGuard_01",
            moisture: Number(body.soil) || 0,
            temperature: Number(body.temperature) || 0,
            light_lux: Number(body.light_lux ?? body.lux) || 0,
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

export async function GET(){
    try{
        const { data, error } = await supabase
            .from("sensor_readings")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100);

        if(error) throw error;

        return NextResponse.json({success:true, data});
    } catch(error){
        return NextResponse.json({success:false, error:`Failed to fetch data:${error}`}, { status: 500 });
    }
}

export async function DELETE(request:Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get("action");

        if(action === "clear_all") {
            const { error } = await supabase
                .from("sensor_readings")
                .delete()
                .neq("id", 0);

            if(error) throw error;

            return NextResponse.json({
                success: true,
                message: "All history cleared",
            });
        }

        if(action === "clear_device"){
            const deviceId = searchParams.get("device_id");

            if(!deviceId){
                return NextResponse.json(
                    { success: false, error: "Device ID required" },
                    { status: 400 }
                );
            }

            const { error } = await supabase
                .from("sensor_readings")
                .delete()
                .eq("device_id", deviceId);

            if (error) throw error;

            return NextResponse.json({
                success: true,
                message: `History cleared for ${deviceId}`,
            });
        }

        return NextResponse.json(
            { success: false, error: "Invalid action" },
            { status: 400 }
        );

    } catch(error){
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}