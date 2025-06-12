import { type NextRequest, NextResponse } from "next/server"
import { getAxionsRegistryIndex } from "@/lib/registry-api"

export async function GET(request: NextRequest) {
  try {
    const index = await getAxionsRegistryIndex()
    return NextResponse.json(index)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch registry" }, { status: 500 })
  }
}
