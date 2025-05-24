import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// GET all facilities with filtering
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const facilityType = url.searchParams.get("type") || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
      ];
    }

    if (facilityType && facilityType !== "ALL") {
      where.facilityType = facilityType;
    }

    const facilities = await prisma.facility.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(facilities);
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return NextResponse.json(
      { error: "Failed to fetch facilities" },
      { status: 500 }
    );
  }
}

// POST to create a new facility
export async function POST(req: NextRequest) {
  try {
    // Only allow admins to create facilities
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "facilityType",
      "address",
      "city",
      "state", 
      "zipCode",
      "country",
    ];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Get geocode data for address if not provided
    if (!data.latitude || !data.longitude) {
      try {
        const geocodeData = await getGeocode(
          `${data.address}, ${data.city}, ${data.state} ${data.zipCode}, ${data.country}`
        );
        if (geocodeData) {
          data.latitude = geocodeData.lat;
          data.longitude = geocodeData.lng;
        }
      } catch (error) {
        console.error("Error geocoding address:", error);
        // Continue without geocode if it fails
      }
    }

    const facility = await prisma.facility.create({
      data: {
        name: data.name,
        facilityType: data.facilityType,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phoneNumber: data.phoneNumber || null,
        email: data.email || null,
        website: data.website || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      },
    });

    revalidatePath("/dashboard/facilities");
    return NextResponse.json(facility);
  } catch (error) {
    console.error("Error creating facility:", error);
    return NextResponse.json(
      { error: "Failed to create facility" },
      { status: 500 }
    );
  }
}

// Helper function to get geocode data from an address
async function getGeocode(address: string) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key not configured");
      return null;
    }

    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}