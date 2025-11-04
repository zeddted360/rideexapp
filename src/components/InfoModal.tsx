'use client';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IPromoOfferFetched } from '../../types/types';

interface InfoModalProps {
  offer: IPromoOfferFetched;
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ offer, isOpen, onClose }: InfoModalProps) {
  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Offer Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <p><strong>Name:</strong> {offer.name}</p>
          <p><strong>Description:</strong> {offer.description}</p>
          <p><strong>Original Price:</strong> {formatPrice(offer.originalPrice)}</p>
          <p><strong>Discounted Price:</strong> {formatPrice(offer.discountedPrice)}</p>
          <p><strong>Extras:</strong> {offer.extras?.join(', ') || 'None'}</p>
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </motion.div>
    </div>
  );
}