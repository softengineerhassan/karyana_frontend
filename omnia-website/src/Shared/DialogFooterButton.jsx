import React from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";

export function DialogFooterButton({
  onCancel,
  onSubmit,
  loading = false,
  mode = "create",
  submitText,
}) {
  const loadingLabel = mode === "create" ? "Creating..." : "Updating...";
  const defaultLabel = mode === "create" ? "Create" : "Update";

  return (
    <div className="flex justify-end gap-2 mt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>

      <Button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="text-white"
        onClick={onSubmit}
      >
        {loading ? (
          <>
            <Spinner className="mr-2" />
            {loadingLabel}
          </>
        ) : (
          submitText || defaultLabel
        )}
      </Button>
    </div>
  );
}
