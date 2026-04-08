import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import useFetchData from "@/hooks/useFetchData";
import { useTranslation } from "react-i18next";

export function ConfirmActionDialog({
  open,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel,
  endpoint,
  method = "POST",
  payload = {},
  onSuccess,
}) {
  const { t } = useTranslation();
  const { executeFetch, loading } = useFetchData();

  const handleConfirm = async () => {
    try {
      const res = await executeFetch(method, endpoint, payload, {
        "Content-Type": "application/json",
      });
      if (res) {
        toast.success(res?.message || t("actionSuccess"));
        onSuccess?.(res);
        onClose();
      }
    } catch (err) {
      console.error("ConfirmActionDialog Error", err);
      toast.error(err?.detail?.error || t("actionFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-primary-foreground">
            {title || t("confirmAction")}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600 mb-4">{message}</p>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel || t("cancel")}
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={loading}
            className="text-white"
          >
            {loading ? (
              <>
                <Spinner className="mr-2" />
                {t("processing")}
              </>
            ) : (
              confirmLabel || t("confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
