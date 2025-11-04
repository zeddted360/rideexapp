'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { IPromoOfferFetched } from '../../../types/types';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteOfferModalProps {
  offer: IPromoOfferFetched;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DeleteOfferModal({ offer, isOpen, onClose, onConfirm, isDeleting }: DeleteOfferModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Delete Offer</h3>
                  <p className="text-red-100 text-sm">This action cannot be undone</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                disabled={isDeleting}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">
                Are you sure you want to delete
              </p>
              <p className="font-bold text-xl text-gray-900 dark:text-white mb-4">
                "{offer.name}"?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This will permanently remove the offer and its associated image from the database. This action cannot be reversed.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isDeleting}
                className="px-6 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                variant="destructive"
                disabled={isDeleting}
                className="px-6 rounded-lg"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Offer'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default DeleteOfferModal;