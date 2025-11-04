"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { IFetchedExtras } from "../../../types/types";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import Link from "next/link";

interface AddExtrasModalProps {
  onAddExtras: (selectedExtras: IFetchedExtras[]) => void;
  loading: boolean;
  excludeTypes?: string[]; // New prop to exclude specific extra types
}

const AddExtrasModal = ({
  onAddExtras,
  loading,
  excludeTypes = [],
}: AddExtrasModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const {extras} = useSelector((state: RootState) => state.extra);

  // Filter out extras based on excludeTypes (e.g., "pack", "plastic container")
  const filteredExtras = extras.filter(
    (extra: IFetchedExtras) =>
      !excludeTypes.some((type) =>
        extra.name.toLowerCase().includes(type.toLowerCase())
      )
  );

  const handleToggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId)
        ? prev.filter((id) => id !== extraId)
        : [...prev, extraId]
    );
  };

  const handleSave = () => {
    const selected = extras.filter((extra) =>
      selectedExtras.includes(extra.$id)
    );
    onAddExtras(selected);
    setIsOpen(false);
    setSelectedExtras([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)} disabled={loading}>
        Add Extras
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Extras</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {filteredExtras.length > 0 ? (
            filteredExtras.map((extra) => (
              <div key={extra.$id} className="flex items-center gap-2">
                <Checkbox
                  id={extra.$id}
                  checked={selectedExtras.includes(extra.$id)}
                  onCheckedChange={() => handleToggleExtra(extra.$id)}
                  disabled={loading}
                />
                <Label htmlFor={extra.$id}>
                  {extra.name} (₦{extra.price})
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No extras available.{" "}
              <Link
                href="#manage-extras"
                className="text-orange-500 hover:underline"
              >
                Add new extras
              </Link>
              .
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || selectedExtras.length === 0}
          >
            Save Extras
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExtrasModal;
