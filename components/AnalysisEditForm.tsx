"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";

interface AnalysisEditFormProps {
  image: any; // Using any for simplicity
  existingAnalysis?: any; // Existing analysis if available
}

export function AnalysisEditForm({
  image,
  existingAnalysis,
}: AnalysisEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing data or defaults
  const [formData, setFormData] = useState({
    riskLevel: existingAnalysis?.riskLevel || "UNKNOWN",
    confidence: existingAnalysis?.confidence?.toString() || "75",
    lesionType: existingAnalysis?.lesionType || "UNKNOWN",
    observations: existingAnalysis?.observations || "",
    recommendations: existingAnalysis?.recommendations || "",
    doctorNotes: existingAnalysis?.doctorNotes || "",
    // ABCDE criteria
    asymmetry: existingAnalysis?.abcdeResults?.asymmetry || false,
    asymmetryScore:
      existingAnalysis?.abcdeResults?.asymmetryScore?.toString() || "0.5",
    border: existingAnalysis?.abcdeResults?.border || false,
    borderScore:
      existingAnalysis?.abcdeResults?.borderScore?.toString() || "0.5",
    color: existingAnalysis?.abcdeResults?.color || false,
    colorScore: existingAnalysis?.abcdeResults?.colorScore?.toString() || "0.5",
    diameter: existingAnalysis?.abcdeResults?.diameter || false,
    diameterValue:
      existingAnalysis?.abcdeResults?.diameterValue?.toString() || "",
    evolution: existingAnalysis?.abcdeResults?.evolution || false,
    evolutionNotes: existingAnalysis?.abcdeResults?.evolutionNotes || "",
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

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [name]: value[0].toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Calculate total ABCDE flags
    const totalFlags = [
      formData.asymmetry,
      formData.border,
      formData.color,
      formData.diameter,
      formData.evolution,
    ].filter(Boolean).length;

    try {
      const analysisId = existingAnalysis?.id;
      const method = analysisId ? "PATCH" : "POST";
      const endpoint = analysisId
        ? `/api/analysis/${analysisId}`
        : "/api/analysis";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId: image.id,
          lesionCaseId: image.lesionCaseId,
          riskLevel: formData.riskLevel,
          confidence: parseFloat(formData.confidence),
          lesionType: formData.lesionType,
          observations: formData.observations,
          recommendations: formData.recommendations,
          doctorNotes: formData.doctorNotes,
          reviewedByDoctor: true,
          // ABCDE data
          abcdeData: {
            asymmetry: formData.asymmetry,
            asymmetryScore: parseFloat(formData.asymmetryScore),
            border: formData.border,
            borderScore: parseFloat(formData.borderScore),
            color: formData.color,
            colorScore: parseFloat(formData.colorScore),
            diameter: formData.diameter,
            diameterValue: formData.diameterValue
              ? parseFloat(formData.diameterValue)
              : null,
            evolution: formData.evolution,
            evolutionNotes: formData.evolutionNotes,
            totalFlags,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save analysis");
      }

      toast({
        title: analysisId ? "Analysis updated" : "Analysis created",
        description: "Analysis data has been successfully saved.",
      });

      // Redirect back to the image page without edit mode
      router.push(`/dashboard/images/${image.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error saving analysis:", error);
      toast({
        title: "Update failed",
        description: "Failed to save analysis data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Risk Level */}
          <div className="space-y-2">
            <Label htmlFor="riskLevel">Risk Level</Label>
            <Select
              value={formData.riskLevel}
              onValueChange={(value) => handleSelectChange("riskLevel", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="UNKNOWN">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lesion Type */}
          <div className="space-y-2">
            <Label htmlFor="lesionType">Lesion Type</Label>
            <Select
              value={formData.lesionType}
              onValueChange={(value) => handleSelectChange("lesionType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select lesion type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MELANOMA">Melanoma</SelectItem>
                <SelectItem value="BASAL_CELL_CARCINOMA">
                  Basal Cell Carcinoma
                </SelectItem>
                <SelectItem value="SQUAMOUS_CELL_CARCINOMA">
                  Squamous Cell Carcinoma
                </SelectItem>
                <SelectItem value="ACTINIC_KERATOSIS">
                  Actinic Keratosis
                </SelectItem>
                <SelectItem value="NEVUS">Nevus</SelectItem>
                <SelectItem value="SEBORRHEIC_KERATOSIS">
                  Seborrheic Keratosis
                </SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
                <SelectItem value="UNKNOWN">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Confidence */}
        <div className="space-y-2">
          <Label htmlFor="confidence">
            Confidence ({formData.confidence}%)
          </Label>
          <Slider
            defaultValue={[parseFloat(formData.confidence)]}
            max={100}
            step={1}
            onValueChange={(value) => handleSliderChange("confidence", value)}
          />
        </div>

        {/* Observations */}
        <div className="space-y-2">
          <Label htmlFor="observations">Observations</Label>
          <Textarea
            id="observations"
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            placeholder="Provide observations about the lesion"
            rows={3}
          />
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <Label htmlFor="recommendations">Recommendations</Label>
          <Textarea
            id="recommendations"
            name="recommendations"
            value={formData.recommendations}
            onChange={handleChange}
            placeholder="Provide treatment or follow-up recommendations"
            rows={3}
          />
        </div>

        {/* Doctor Notes */}
        <div className="space-y-2">
          <Label htmlFor="doctorNotes">Doctor Notes</Label>
          <Textarea
            id="doctorNotes"
            name="doctorNotes"
            value={formData.doctorNotes}
            onChange={handleChange}
            placeholder="Add your professional assessment notes"
            rows={3}
          />
        </div>

        {/* ABCDE Criteria */}
        <div className="space-y-4 border-t pt-4 mt-4">
          <h3 className="font-medium">ABCDE Criteria</h3>

          {/* Asymmetry */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="asymmetry"
                checked={formData.asymmetry}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("asymmetry", checked === true)
                }
              />
              <Label htmlFor="asymmetry">Asymmetry</Label>
            </div>

            {formData.asymmetry && (
              <div className="ml-7">
                <Label htmlFor="asymmetryScore">
                  Asymmetry Score ({parseInt(formData.asymmetryScore) * 100}%)
                </Label>
                <Slider
                  defaultValue={[parseFloat(formData.asymmetryScore)]}
                  max={1}
                  step={0.01}
                  onValueChange={(value) =>
                    handleSliderChange("asymmetryScore", value)
                  }
                />
              </div>
            )}
          </div>

          {/* Border */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="border"
                checked={formData.border}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("border", checked === true)
                }
              />
              <Label htmlFor="border">Border Irregularity</Label>
            </div>

            {formData.border && (
              <div className="ml-7">
                <Label htmlFor="borderScore">
                  Border Score ({parseInt(formData.borderScore) * 100}%)
                </Label>
                <Slider
                  defaultValue={[parseFloat(formData.borderScore)]}
                  max={1}
                  step={0.01}
                  onValueChange={(value) =>
                    handleSliderChange("borderScore", value)
                  }
                />
              </div>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="color"
                checked={formData.color}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("color", checked === true)
                }
              />
              <Label htmlFor="color">Color Variegation</Label>
            </div>

            {formData.color && (
              <div className="ml-7">
                <Label htmlFor="colorScore">
                  Color Score ({parseInt(formData.colorScore) * 100}%)
                </Label>
                <Slider
                  defaultValue={[parseFloat(formData.colorScore)]}
                  max={1}
                  step={0.01}
                  onValueChange={(value) =>
                    handleSliderChange("colorScore", value)
                  }
                />
              </div>
            )}
          </div>

          {/* Diameter */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="diameter"
                checked={formData.diameter}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("diameter", checked === true)
                }
              />
              <Label htmlFor="diameter">Diameter - 6mm</Label>
            </div>

            {formData.diameter && (
              <div className="ml-7">
                <Label htmlFor="diameterValue">Diameter (mm)</Label>
                <Input
                  id="diameterValue"
                  name="diameterValue"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.diameterValue}
                  onChange={handleChange}
                  placeholder="Diameter in mm"
                />
              </div>
            )}
          </div>

          {/* Evolution */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="evolution"
                checked={formData.evolution}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("evolution", checked === true)
                }
              />
              <Label htmlFor="evolution">Evolution/Change Over Time</Label>
            </div>

            {formData.evolution && (
              <div className="ml-7">
                <Label htmlFor="evolutionNotes">Evolution Notes</Label>
                <Textarea
                  id="evolutionNotes"
                  name="evolutionNotes"
                  value={formData.evolutionNotes}
                  onChange={handleChange}
                  placeholder="Describe how the lesion has changed"
                  rows={2}
                />
              </div>
            )}
          </div>
        </div>
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
          {isSubmitting ? "Saving..." : "Save Analysis"}
        </Button>
      </div>
    </form>
  );
}
