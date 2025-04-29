import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const INTERNAL_API_KEY = "smpp_internal_key"

export async function POST(req: Request) {
  try {
    // Check authorization
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${INTERNAL_API_KEY}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { destination, message, source_addr } = body

    if (!destination || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Make request to SMPP service
    const response = await fetch('http://localhost:3001/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination,
        message,
        source_addr: source_addr || "45578"
      })
    });

    if (!response.ok) {
      throw new Error(`SMPP service returned ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("[SMPP_SEND]", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
} 