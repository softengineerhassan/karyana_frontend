import React from "react";
import { useController } from "react-hook-form";
import { WithContext as ReactTags } from "react-tag-input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

const TagInputField = ({ name, control, label, required }) => {
  const { t } = useTranslation();
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: required ? { required: t("tagRequired") } : {},
    defaultValue: [],
  });

  const handleDelete = (i) => {
    const newTags = value.filter((_, index) => index !== i);
    onChange(newTags);
  };

  const handleAddition = (tag) => {
    const formattedTag = tag.text.startsWith("#") ? tag.text : `#${tag.text}`;
    onChange([...value, { ...tag, text: formattedTag }]);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </Label>
      )}
      <ReactTags
        tags={Array.isArray(value) ? value : []}
        handleDelete={handleDelete}
        handleAddition={handleAddition}
        placeholder={t("addNewTag")}
        classNames={{
          tags: "ReactTags__tags",
          tagInput: "ReactTags__tagInput",
          tagInputField: "ReactTags__tagInputField",
          selected: "ReactTags__selected",
          tag: "ReactTags__tag",
          remove: "ReactTags__remove",
        }}
      />
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
};

export default TagInputField;
