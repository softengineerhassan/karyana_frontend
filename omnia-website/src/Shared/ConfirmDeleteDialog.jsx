import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import toast from "react-hot-toast";

const ConfirmDeleteDialog = ({
  open,
  setOpen,
  item,
  executeFetch,
  refreshList,
  deleteUrl,
  successMessage = "Item deleted successfully!", 
  errorMessage = "Failed to delete item.", 
  itemNameField = "name", 
  itemIdField = "id", 
}) => {
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await executeFetch("DELETE", `${deleteUrl}/${item[itemIdField]}`);
      toast.success(res?.message || successMessage); 
      refreshList();
      setOpen(false);
    } catch (err) {
      toast.error(err?.detail?.error || errorMessage); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-gray-700">Delete Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {item[itemNameField]}? 
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner className="w-4 h-4" />
                Deleting...
              </div>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
