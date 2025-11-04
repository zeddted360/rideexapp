
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, X } from 'lucide-react';
import React, { Dispatch, FC, SetStateAction } from 'react'
import { IBookedOrderFetched } from '../../../types/types';

interface ICancelDialogProps {
  cancelDialogOpen: boolean;
  setCancelDialogOpen: Dispatch<SetStateAction<boolean>>;
  latestOrder: IBookedOrderFetched;
  handleCancelOrder: () => Promise<void>;
  cancelling: boolean;
  riderCode:string;
}

const CancelDialog: FC<ICancelDialogProps> = ({
    cancelDialogOpen,
    cancelling,
    handleCancelOrder,
    latestOrder,
    setCancelDialogOpen,
    riderCode
}) => {

  return (
    <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
      <DialogContent className="max-w-md mx-auto dark:bg-gray-800 rounded-2xl">
        <DialogHeader className="space-y-3">
          <div className="w-14 h-14 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            Cancel Order?
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-sm text-center space-y-3">
          {latestOrder.status === "preparing" && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-900/30">
              <p className="text-orange-700 dark:text-orange-300 text-xs font-medium">
                Warning: Your order may already be in preparation
              </p>
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to cancel order{" "}
            <span className="font-semibold">{riderCode}</span>?
          </p>
        </DialogDescription>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto h-11">
              Keep Order
            </Button>
          </DialogClose>
          <Button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="w-full sm:w-auto h-11 bg-red-500 hover:bg-red-600"
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
}

export default CancelDialog