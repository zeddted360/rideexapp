// components/offers/EditHeaderModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { createHeaderConfig, updateHeaderConfig } from "@/state/headerSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import { fileUrl, validateEnv } from "@/utils/appwrite";

interface EditHeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: any;
}

export default function EditHeaderModal({
  isOpen,
  onClose,
  currentConfig,
}: EditHeaderModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.header);

  const [title, setTitle] = useState("RideEx MiniMart");
  const [subtitle, setSubtitle] = useState(
    "Shop groceries, drinks, and essentials"
  );
  const [logoType, setLogoType] = useState<"icon" | "image">("icon");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bucketId = validateEnv().offerHeaderLogoBucketId;

  useEffect(() => {
    if (currentConfig) {
      setTitle(currentConfig.title || "RideEx MiniMart");
      setSubtitle(
        currentConfig.subtitle || "Shop groceries, drinks, and essentials"
      );
      setLogoType(currentConfig.logoType || "icon");

      if (currentConfig.logoType === "image" && currentConfig.logoUrl) {
        setLogoPreview(fileUrl(bucketId, currentConfig.logoUrl));
      }
    }
  }, [currentConfig, bucketId]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, logo: "Please select an image file" });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, logo: "Image size should be less than 5MB" });
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrors({ ...errors, logo: "" });
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!subtitle.trim()) {
      newErrors.subtitle = "Subtitle is required";
    }

    if (logoType === "image" && !logoPreview && !currentConfig?.logoUrl) {
      newErrors.logo = "Please upload a logo image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      logoType,
      logoFile: logoType === "image" ? logoFile : null,
      currentLogoId: currentConfig?.logoUrl || null,
    };

    try {
      if (currentConfig?.$id) {
        // Update existing config
        await dispatch(
          updateHeaderConfig({
            configId: currentConfig.$id,
            data: formData,
          })
        ).unwrap();
      } else {
        // Create new config
        await dispatch(createHeaderConfig(formData)).unwrap();
      }
      onClose();
    } catch (error) {
      console.error("Failed to save header config:", error);
      setErrors({ submit: "Failed to save changes. Please try again." });
    }
  };

  const handleClose = () => {
    // Reset form
    setTitle("RideEx MiniMart");
    setSubtitle("Shop groceries, drinks, and essentials");
    setLogoType("icon");
    setLogoFile(null);
    setLogoPreview(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Header Section</DialogTitle>
          <DialogDescription>
            Customize your header section. The "Order Now" button text cannot be
            changed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="RideEx MiniMart"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle *</Label>
            <Textarea
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Shop groceries, drinks, and essentials"
              rows={2}
              className={errors.subtitle ? "border-red-500" : ""}
            />
            {errors.subtitle && (
              <p className="text-sm text-red-500">{errors.subtitle}</p>
            )}
          </div>

          {/* Logo Type */}
          <div className="space-y-3">
            <Label>Logo Type *</Label>
            <RadioGroup
              value={logoType}
              onValueChange={(value: "icon" | "image") => setLogoType(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="icon" id="icon" />
                <Label
                  htmlFor="icon"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Default Icon (Shopping Cart)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="image" />
                <Label
                  htmlFor="image"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  Custom Image
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Logo Upload */}
          {logoType === "image" && (
            <div className="space-y-3">
              <Label>Logo Image *</Label>

              {logoPreview ? (
                <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <Label
                    htmlFor="logo-upload"
                    className="cursor-pointer text-sm text-blue-600 hover:text-blue-700"
                  >
                    Click to upload logo
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}

              {errors.logo && (
                <p className="text-sm text-red-500">{errors.logo}</p>
              )}
            </div>
          )}

          {/* Info about button */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> The "Order Now" button text is constant and
              cannot be changed. It automatically toggles between "Order Now"
              and "Hide Items" based on the list visibility.
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                {errors.submit}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading === "pending"}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading === "pending"}>
              {loading === "pending" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
