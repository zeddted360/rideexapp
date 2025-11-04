import { Loader2, XCircle } from 'lucide-react';
import React, { Dispatch, FC, SetStateAction } from 'react'
import { IDiscountFetched, IFeaturedItemFetched, IMenuItemFetched, IPopularItemFetched } from '../../../types/types';

interface DeleteConfirmModalProps {
    setShowDeleteModal:Dispatch<SetStateAction<boolean>>;
    selectedItem:IMenuItemFetched | IFeaturedItemFetched | IPopularItemFetched | IDiscountFetched;
    isDeleting:boolean;
    confirmDelete: () => Promise<void>;
}

const DeleteConfirmModal:FC<DeleteConfirmModalProps> = ({
    selectedItem,
    setShowDeleteModal,
    isDeleting,
    confirmDelete
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Confirm Delete
            </h3>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4 mb-6">
            <div className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <b>
                {selectedItem.name || (selectedItem as IDiscountFetched).title}?
              </b>{" "}
              This action cannot be undone.
            </div>
          </div>
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal