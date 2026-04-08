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

export function DeleteDialog({
  item,
  open,
  onClose,
  onSuccess,
  endpoint,
  getItemName,
  getItemId,
  entityName = "Item",
}) {
  const { executeFetch, loading } = useFetchData();
  const { t } = useTranslation();

  if (!item) return null;

  const handleDelete = async () => {
    try {
      const id = getItemId ? getItemId(item) : item.id;
      const url =
        typeof endpoint === "function" ? endpoint(item) : `${endpoint}/${id}`;
      const res = await executeFetch("DELETE", url);
      if (res) {
        toast.success(res?.message || `${entityName} deleted successfully`);
        onSuccess?.();
        onClose?.();
      }
    } catch (err) {
      console.error(`Delete ${entityName} Error`, err);
      toast.error(err?.detail?.error || `Failed to delete ${entityName}`);
    }
  };

  const itemName = getItemName ? getItemName(item) : item.name || "";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-primary-foreground">
            {t("confirmDelete")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 mb-4">
          {t("deleteItemMessage", { item: "" })}{" "}
          <span className="font-bold">{itemName}</span>?
        </p>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner className="mr-2" />
                {t("deleting")}
              </>
            ) : (
              t("delete")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
