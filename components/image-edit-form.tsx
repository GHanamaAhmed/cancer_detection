"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface ImageEditFormProps {
  image: any; // Using any for simplicity, but you can define a proper type
}

export function ImageEditForm({ image }: ImageEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bodyLocation: image.bodyLocation || "OTHER",
    lesionSize: image.lesionSize?.toString() || "",
    notes: image.notes || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/images/${image.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bodyLocation: formData.bodyLocation,
          lesionSize: formData.lesionSize
            ? parseFloat(formData.lesionSize)
            : null,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update image");
      }

      toast({
        title: "Image updated",
        description: "Image details have been successfully updated.",
      });

      // Redirect back to the image page without edit mode
      router.push(`/dashboard/images/${image.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating image:", error);
      toast({
        title: "Update failed",
        description: "Failed to update image details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bodyLocation">Body Location</Label>
        <Select
          value={formData.bodyLocation}
          onValueChange={(value) => handleSelectChange("bodyLocation", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select body location" />
          </SelectTrigger>
          <SelectContent>
            {[
              "HEAD",
              "NECK",
              "CHEST",
              "BACK",
              "ABDOMEN",
              "ARMS",
              "HANDS",
              "LEGS",
              "FEET",
              "OTHER",
            ].map((location) => (
              <SelectItem key={location} value={location}>
                {location.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesionSize">Lesion Size (mm)</Label>
        <Input
          id="lesionSize"
          name="lesionSize"
          type="number"
          step="0.1"
          min="0"
          value={formData.lesionSize}
          onChange={handleChange}
          placeholder="Enter size in millimeters"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add notes about this image"
          rows={5}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/images/${image.id}`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
