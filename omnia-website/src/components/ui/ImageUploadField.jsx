import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { useController } from "react-hook-form";
import { useTranslation } from "react-i18next";

export default function ImageUploadField({
  name, 
  control,
  label = "Image", 
  required = false,
  defaultPreview = null, 
}) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(defaultPreview);
  const { t } = useTranslation();

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: required ? { required: `${label} is required` } : {},
  });

  useEffect(() => {
    if (defaultPreview) {
      setPreview(defaultPreview);
      onChange(defaultPreview); 
    }
  }, [defaultPreview, onChange]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result);
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result);
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {label || t("image")}
      </Label>
      <div
        className="relative border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-transparent hover:bg-gray-100/10 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
               alt={t("preview")}
              className="max-h-32 mx-auto rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-16 h-16 mx-auto bg-pink-100 rounded-lg flex items-center justify-center">
              <Upload className="h-8 w-8 text-pink-500" />
            </div>
            <p className="text-sm font-medium text-primary-foreground">
                {t("dropOrClickUpload")}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-200 mt-1">
               {t("fileFormats")}
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
}
