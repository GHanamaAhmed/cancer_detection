"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface FacilitiesMapProps {
  search: string;
  facilityType: string;
}

interface Facility {
  id: string;
  name: string;
  facilityType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

export function FacilitiesMap({ search, facilityType }: FacilitiesMapProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  );
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const { toast } = useToast();

  // Load Google Maps API
  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
          libraries: ["places"],
        });

        const google = await loader.load();

        if (!mapRef.current) return;

        const newMap = new google.maps.Map(mapRef.current, {
          center: { lat: 39.8283, lng: -98.5795 }, // Center of USA
          zoom: 4,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        const newInfoWindow = new google.maps.InfoWindow();

        setMap(newMap);
        setInfoWindow(newInfoWindow);
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setError("Failed to load Google Maps. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load Google Maps",
          variant: "destructive",
        });
      }
    };

    initMap();
  }, [toast]);

  // Fetch facilities data
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const url = new URL("/api/facilities", window.location.origin);

        if (search) url.searchParams.append("search", search);
        if (facilityType) url.searchParams.append("type", facilityType);

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error("Failed to fetch facilities");
        }

        const data = await response.json();
        setFacilities(data);
      } catch (err) {
        console.error("Error fetching facilities:", err);
        setError("Failed to load facilities data");
        toast({
          title: "Error",
          description: "Failed to load facilities data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [search, facilityType, toast]);

  // Update markers when facilities or map changes
  const updateMarkers = useCallback(() => {
    if (!map || !infoWindow) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoordinates = false;

    facilities.forEach((facility) => {
      if (facility.latitude && facility.longitude) {
        hasValidCoordinates = true;
        const position = {
          lat: facility.latitude,
          lng: facility.longitude,
        };

        const marker = new google.maps.Marker({
          position,
          map,
          title: facility.name,
          animation: google.maps.Animation.DROP,
        });

        marker.addListener("click", () => {
          setSelectedFacility(facility);

          const content = `
            <div class="p-2">
              <h3 class="font-medium text-lg">${facility.name}</h3>
              <p class="text-sm text-gray-500">${facility.address}, ${
            facility.city
          }, ${facility.state}</p>
              <p class="text-sm mt-1">${facility.facilityType.replace(
                /_/g,
                " "
              )}</p>
              <a href="/dashboard/facilities/${
                facility.id
              }" class="text-blue-600 text-sm hover:underline mt-2 inline-block">View details →</a>
            </div>
          `;

          infoWindow.setContent(content);
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
        bounds.extend(position);
      }
    });

    // Adjust map bounds if we have valid coordinates
    if (hasValidCoordinates) {
      map.fitBounds(bounds);

      // Don't zoom in too far on small datasets
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom() > 16) {
          map.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [facilities, map, infoWindow]);

  // Update markers when data changes
  useEffect(() => {
    if (map && facilities.length > 0) {
      updateMarkers();
    }
  }, [map, facilities, updateMarkers]);

  if (error) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center bg-gray-100 rounded-md">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (loading && !map) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] rounded-md overflow-hidden border">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
