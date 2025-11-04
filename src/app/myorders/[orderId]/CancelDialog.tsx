import React, { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IBookedOrderFetched } from "../../../../types/types";

interface ICancelDialogProps {
  cancelDialogOpen: boolean;
  setCancelDialogOpen: Dispatch<SetStateAction<boolean>>;
  currentOrder: IBookedOrderFetched;
  handleCancelOrder: () => void;
  cancelling: boolean;
}

const CancelDialog: React.FC<ICancelDialogProps> = ({
  cancelDialogOpen,
  currentOrder,
  handleCancelOrder,
  setCancelDialogOpen,
  cancelling,
}) => {
  return (
    <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
      <DialogContent className="max-w-md mx-auto dark:bg-gray-800 rounded-2xl">
        <DialogHeader className="space-y-3">
          <div className="w-14 h-14 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-center dark:text-white">
            Cancel Order?
          </DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-3">
          {currentOrder?.status === "preparing" && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-900/30">
              <p className="text-xs font-medium text-orange-700 dark:text-orange-300">
                ⚠️ Your order may already be in preparation
              </p>
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to cancel order{" "}
            <span className="font-semibold">
              {currentOrder?.riderCode?.toUpperCase()}
            </span>
            ? This action cannot be undone.
          </p>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 mt-4">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto h-11 font-medium"
            >
              Keep Order
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleCancelOrder}
            className="w-full sm:w-auto h-11 font-medium bg-red-500 hover:bg-red-600"
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Confirm Cancel"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelDialog;
