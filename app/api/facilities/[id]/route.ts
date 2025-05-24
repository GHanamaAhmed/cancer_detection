import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// GET facility by ID
export async function GET(
  req: NextRequest,
  { params: p }: { params: Promise<{ id: string }> }
) {
  try { 
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const params = await p;
    const facility = await prisma.facility.findUnique({
      where: { id: params.id },
      include: {
        doctors: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    profile: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!facility) {
      return NextResponse.json(
        { error: "Facility not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(facility);
  } catch (error) {
    console.error("Error fetching facility:", error);
    return NextResponse.json(
      { error: "Failed to fetch facility" },
      { status: 500 }
    );
  }
}

// PUT to update a facility
export async function PUT(
  req: NextRequest,
  { params: p }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await p;
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Check if facility exists
    const existingFacility = await prisma.facility.findUnique({
      where: { id: params.id },
    });

    if (!existingFacility) {
      return NextResponse.json(
        { error: "Facility not found" },
        { status: 404 }
      );
    }

    // Update geocode if address changed
    let latitude = data.latitude;
    let longitude = data.longitude;

    const addressChanged =
      data.address !== existingFacility.address ||
      data.city !== existingFacility.city ||
      data.state !== existingFacility.state ||
      data.zipCode !== existingFacility.zipCode ||
      data.country !== existingFacility.country;

    if (addressChanged) {
      try {
        const geocodeData = await getGeocode(
          `${data.address}, ${data.city}, ${data.state} ${data.zipCode}, ${data.country}`
        );
        if (geocodeData) {
          latitude = geocodeData.lat;
          longitude = geocodeData.lng;
        }
      } catch (error) {
        console.error("Error geocoding address:", error);
        // Continue with update even if geocoding fails
      }
    }

    const updatedFacility = await prisma.facility.update({
      where: { id: params.id },
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
        latitude: latitude || null,
        longitude: longitude || null,
      },
    });

    revalidatePath("/dashboard/facilities");
    revalidatePath(`/dashboard/facilities/${params.id}`);

    return NextResponse.json(updatedFacility);
  } catch (error) {
    console.error("Error updating facility:", error);
    return NextResponse.json(
      { error: "Failed to update facility" },
      { status: 500 }
    );
  }
}

// DELETE a facility
export async function DELETE(
  req: NextRequest,
  { params: p }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await p;
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if facility exists
    const existingFacility = await prisma.facility.findUnique({
      where: { id: params.id },
    });

    if (!existingFacility) {
      return NextResponse.json(
        { error: "Facility not found" },
        { status: 404 }
      );
    }

    // Delete facility with cascade to related records
    await prisma.$transaction([
      // First remove any doctor facility connections
      prisma.doctorFacility.deleteMany({
        where: { facilityId: params.id },
      }),
      // Then delete the facility
      prisma.facility.delete({
        where: { id: params.id },
      }),
    ]);

    revalidatePath("/dashboard/facilities");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting facility:", error);
    return NextResponse.json(
      { error: "Failed to delete facility" },
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
