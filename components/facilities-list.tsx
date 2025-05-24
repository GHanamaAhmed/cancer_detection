"use client";

import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Edit, Trash } from "lucide-react";
import { FacilityTypeFilter } from "@/components/facility-type-filter";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FacilitiesListProps {
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
  phoneNumber?: string | null;
  email?: string | null;
  website?: string | null;
}

export function FacilitiesList({ search, facilityType }: FacilitiesListProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facilityToDelete, setFacilityToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch facilities
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

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/facilities/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete facility");
      }

      // Update the local state to remove the deleted facility
      setFacilities(facilities.filter((facility) => facility.id !== id));

      toast({
        title: "Success",
        description: "Facility deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting facility:", err);
      toast({
        title: "Error",
        description: "Failed to delete facility",
        variant: "destructive",
      });
    } finally {
      setFacilityToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <FacilityTypeFilter currentType={facilityType} />
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <FacilityTypeFilter currentType={facilityType} />
        <div className="flex flex-col items-center justify-center h-40 text-red-600">
          <p className="mb-2">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (facilities.length === 0) {
    return (
      <div className="space-y-4">
        <FacilityTypeFilter currentType={facilityType} />
        <div className="flex h-40 flex-col items-center justify-center text-gray-500">
          <p>No facilities found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FacilityTypeFilter currentType={facilityType} />

      {facilities.map((facility) => (
        <div key={facility.id} className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{facility.name}</h3>
              <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3 w-3" />
                <span>
                  {facility.address}, {facility.city}, {facility.state}
                </span>
              </div>
              <div className="mt-2">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {facility.facilityType.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a href={`/dashboard/facilities/${facility.id}`}>
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a href={`/dashboard/facilities/${facility.id}/edit`}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </a>
              </Button>
              <AlertDialog
                open={facilityToDelete === facility.id}
                onOpenChange={(open) => !open && setFacilityToDelete(null)}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => setFacilityToDelete(facility.id)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {facility.name}. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => handleDelete(facility.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
