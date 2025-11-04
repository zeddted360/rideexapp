// components/FileInput.tsx
"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { ImageIcon } from "lucide-react";

interface FileInputProps {
  field: any;
  label: string;
}

const FileInput = ({ field, label }: FileInputProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Label>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
        <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Drag & drop or click to upload
        </span>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          {...field}
          onChange={(e) => {
            field.onChange(e);
            if (e.target.files && e.target.files[0]) {
              const reader = new FileReader();
              reader.onload = (ev) => setPreview(ev.target?.result as string);
              reader.readAsDataURL(e.target.files[0]);
            } else {
              setPreview(null);
            }
          }}
        />
      </label>
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mt-2 rounded-lg w-24 h-24 object-cover border border-gray-200 dark:border-gray-700 mx-auto"
        />
      )}
    </div>
  );
};

export default FileInput;