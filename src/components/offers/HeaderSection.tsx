// components/offers/HeaderSection.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShoppingCart,
  Sparkles,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/authContext";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteHeaderConfig, fetchHeaderConfig } from "@/state/headerSlice";
import EditHeaderModal from "./EditHeaderModal";

interface HeaderSectionProps {
  onOrderNow: () => void;
  showList: boolean;
}

// Default configuration
const DEFAULT_CONFIG = {
  title: "RideEx MiniMart",
  subtitle: "Shop groceries, drinks, and essentials",
  buttonText: "Order Now",
  logoType: "icon" as "icon" | "image",
  logoUrl: null,
};

export function HeaderSection({ onOrderNow, showList }: HeaderSectionProps) {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { headerConfig, loading, error } = useSelector(
    (state: RootState) => state.header
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.role === "admin";
  const bucketId = validateEnv().offerHeaderLogoBucketId;

  useEffect(() => {
    dispatch(fetchHeaderConfig());
  }, [dispatch]);

  // Use header config if available, otherwise use defaults
  const config = headerConfig || DEFAULT_CONFIG;
  const logoUrl =
    config.logoType === "image" && config.logoUrl
      ? fileUrl(bucketId, config.logoUrl)
      : null;

  const handleDelete = async () => {
    if (!headerConfig?.$id) return;

    setIsDeleting(true);
    try {
      await dispatch(
        deleteHeaderConfig({
          configId: headerConfig.$id,
          logoId: headerConfig.logoUrl || "",
        })
      ).unwrap();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete header config:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 p-6 sm:p-8 mb-6 shadow-xl"
      >
        {/* Background patterns */}
        <div className="absolute inset-0 bg-black/5"></div>
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* Admin controls */}
        {isAdmin && (
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-orange-600"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Header
            </Button>
            {headerConfig && (
              <Button
                onClick={() => setIsDeleteDialogOpen(true)}
                size="sm"
                variant="destructive"
                className="bg-red-500/90 hover:bg-red-600 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        )}

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Logo/Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="relative flex-shrink-0"
            >
              {loading === "pending" ? (
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                </div>
              ) : logoUrl ? (
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-xl overflow-hidden backdrop-blur-sm border border-white/30 shadow-lg">
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                  <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
              )}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-3 h-3 text-orange-800" />
              </div>
            </motion.div>

            {/* Title and Subtitle */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {config.title}
              </h2>
              <p className="text-orange-50 text-sm">{config.subtitle}</p>
            </div>
          </div>

          {/* Order Now Button - Always constant */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOrderNow}
            className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group"
          >
            {showList ? "Hide Items" : "Order Now"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-10 h-10 bg-amber-400/20 rounded-full blur-lg"></div>
      </motion.div>

      {/* Edit Modal */}
      <EditHeaderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentConfig={headerConfig}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete your custom header configuration and restore the
              default design. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset to Default"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
