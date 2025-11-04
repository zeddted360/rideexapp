"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/authContext";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface OrderFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  customerPhone: string;
  riderCode?:String
}

const OrderFeedbackModal: React.FC<OrderFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customerPhone,
  riderCode

}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/send-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment,
          phone: customerPhone,
          email: user?.email || "",
          riderCode
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send feedback email");
      }
      await onSubmit(rating, comment);
      toast.success("Thank you for your feedback!");
      router.push("/")
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto dark:bg-gray-800 rounded-2xl">
        <DialogHeader className="space-y-3">
          <div className="w-14 h-14 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-orange-500" />
          </div>
          <DialogTitle className="dark:text-gray-100 text-xl font-bold text-center">
            How was your experience?
          </DialogTitle>
        </DialogHeader>

        <div className="dark:text-gray-300 text-sm text-center leading-relaxed space-y-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
                className="focus:outline-none"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= rating
                      ? "fill-orange-500 text-orange-500"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </motion.button>
            ))}
          </div>

          <Textarea
            placeholder="Share your thoughts (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 mt-4">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto h-11 font-medium"
              onClick={() => {
                setRating(0);
                setComment("");
              }}
            >
              Skip
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            className="w-full sm:w-auto h-11 font-medium bg-orange-500 hover:bg-orange-600 text-white"
            disabled={submitting || rating === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderFeedbackModal;
