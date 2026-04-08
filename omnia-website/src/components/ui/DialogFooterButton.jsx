import React from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { useTranslation } from "react-i18next";

export function DialogFooterButton({
  onCancel,
  onSubmit,
  loading = false,
  mode = "create",
  submitText,
}) {
    const { t } = useTranslation();
  return (
    <React.Fragment>
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
           {t("cancel")}
        </Button>
        <Button type="submit" disabled={loading} aria-busy={loading} className="text-white" onClick={onSubmit}>
          {loading ? (
            <>
              <Spinner className="mr-2" />
              {mode === "create" ? t("creating") : t("updating")}
            </>
          ) : (
            submitText || (mode === "create" ? t("create") : t("update"))
          )}
        </Button>
      </div>
    </React.Fragment>
  );
}
