"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw } from "lucide-react";

interface LocationPickerProps {
  onChange: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  onGeocodeRef?: (geocodeFn: (address: string) => Promise<void>) => void;
  visible?: boolean; // Add this prop to track dialog visibility
}

export function LocationPicker({
  onChange,
  initialLat,
  initialLng,
  onGeocodeRef,
  visible = true, // Default to true if not provided
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  const googleRef = useRef<any>(null);

  // Function to geocode address and update map
  const geocodeAddress = async (address: string) => {
    if (!map) return;

    try {
      console.log("Geocoding address:", address);
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address });

      if (result.results.length > 0) {
        const location = result.results[0].geometry.location;

        map.setCenter(location);
        map.setZoom(15);

        // Remove existing marker if any
        if (marker) {
          marker.setMap(null);
        }

        // Create new marker
        const newMarker = new google.maps.Marker({
          position: location,
          map,
          draggable: true,
        });

        setMarker(newMarker);
        onChange(location.lat(), location.lng());

        // Handle marker drag end
        newMarker.addListener("dragend", () => {
          const position = newMarker.getPosition();
          if (position) {
            onChange(position.lat(), position.lng());
          }
        });
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setError(
        "Failed to geocode address. Please try clicking on the map instead."
      );
    }
  };

  // Expose the geocode function via ref if parent component needs it
  useEffect(() => {
    if (onGeocodeRef) {
      onGeocodeRef(geocodeAddress);
    }
  }, [map, marker, onGeocodeRef]);

  // Simple initialization function that works like FacilitiesMap
  const initializeMap = useCallback(async () => {
    if (!mapRef.current) {
      console.log("Map container not available yet");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(
        "Initializing map with container dimensions:",
        mapRef.current.clientWidth,
        mapRef.current.clientHeight
      );

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

      // Load Google Maps if not already loaded
      if (!googleRef.current) {
        const loader = new Loader({
          apiKey,
          version: "weekly",
          libraries: ["places"],
        });

        googleRef.current = await loader.load();
      }

      // Default to US center if no initial coordinates
      const center =
        initialLat && initialLng
          ? { lat: initialLat, lng: initialLng }
          : { lat: 39.8283, lng: -98.5795 }; // Center of US

      const newMap = new googleRef.current.maps.Map(mapRef.current, {
        center,
        zoom: initialLat && initialLng ? 15 : 4,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Add initial marker if coordinates provided
      if (initialLat && initialLng) {
        const newMarker = new googleRef.current.maps.Marker({
          position: { lat: initialLat, lng: initialLng },
          map: newMap,
          draggable: true,
        });

        setMarker(newMarker);

        // Handle marker drag end
        newMarker.addListener("dragend", () => {
          const position = newMarker.getPosition();
          if (position) {
            onChange(position.lat(), position.lng());
          }
        });
      }

      // Add click listener to map
      newMap.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          // Remove existing marker if any
          if (marker) {
            marker.setMap(null);
          }

          // Create new marker at clicked position
          const newMarker = new googleRef.current.maps.Marker({
            position: e.latLng,
            map: newMap,
            draggable: true,
            animation: googleRef.current.maps.Animation.DROP,
          });

          setMarker(newMarker);
          onChange(e.latLng.lat(), e.latLng.lng());

          // Handle marker drag end
          newMarker.addListener("dragend", () => {
            const position = newMarker.getPosition();
            if (position) {
              onChange(position.lat(), position.lng());
            }
          });
        }
      });

      // Force a resize to ensure proper rendering
      setTimeout(() => {
        googleRef.current.maps.event.trigger(newMap, "resize");
        newMap.setCenter(center);
      }, 100);

      setMap(newMap);
      setMapInitialized(true);
      setLoading(false);
      console.log("Map initialized successfully");

      return true;
    } catch (error) {
      console.error("Error initializing map:", error);
      setError("Failed to initialize map. Please try again.");
      setLoading(false);
      return false;
    }
  }, [initialLat, initialLng, onChange]);

  // Cleanup function
  const cleanupMap = useCallback(() => {
    if (marker) {
      marker.setMap(null);
    }

    if (map && typeof window !== "undefined" && window.google) {
      google.maps.event.clearInstanceListeners(map);
    }

    setMap(null);
    setMarker(null);
  }, [map, marker]);

  // Initialize or reinitialize map when visible changes
  useEffect(() => {
    // Only try to initialize if component is visible
    if (visible && !mapInitialized) {
      // Use a small delay to ensure DOM is ready
      const timerId = setTimeout(() => {
        initializeMap();
      }, 300);

      return () => clearTimeout(timerId);
    }

    // Cleanup when component becomes invisible
    if (!visible && map) {
      cleanupMap();
    }
  }, [visible, mapInitialized, map, initializeMap, cleanupMap]);

  // Handle manual initialization
  const handleRetryInitialization = () => {
    setMapInitialized(false);
    initializeMap();
  };

  if (!visible) {
    return null;
  }

  if (error) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center bg-gray-100 rounded-md">
        <p className="text-red-600 mb-2">{error}</p>
        <Button
          onClick={handleRetryInitialization}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  if (loading && !mapInitialized) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-gray-100 rounded-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={mapRef}
        id="map-container"
        className="h-[300px] w-full rounded-md border"
        style={{
          minHeight: "300px",
          display: "block",
          position: "relative",
        }}
      />
      {mapInitialized ? (
        <div className="text-sm text-gray-500 flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          <span>Click on the map to set location or search by address</span>
        </div>
      ) : (
        <div className="text-center">
          <Button
            onClick={handleRetryInitialization}
            variant="outline"
            size="sm"
          >
            <MapPin className="h-4 w-4 mr-1" />
            Initialize Map
          </Button>
        </div>
      )}
    </div>
  );
}
