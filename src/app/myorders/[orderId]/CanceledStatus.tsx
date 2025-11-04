
import React from 'react'
import { motion } from "framer-motion";
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
const CanceledStatus = () => {

    const router = useRouter();
    
  return (
       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 py-6">
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center border border-red-200 dark:border-red-900/40"
         >
           <motion.div
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ type: "spring", stiffness: 200 }}
             className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
           >
             <XCircle className="w-16 h-16 text-red-500" />
           </motion.div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
             Order Cancelled
           </h2>
           <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
             This order has been cancelled. For more details or assistance,
             please contact our support team.
           </p>
           <div className="space-y-3">
             <Button
               onClick={() => router.push("/menu")}
               className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl"
             >
               Place New Order
             </Button>
             <Button
               onClick={() => router.push("/myorders")}
               variant="outline"
               className="w-full h-12 border-2 border-orange-500 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20"
             >
               View My Orders
             </Button>
           </div>
         </motion.div>
       </div>
     );
}

export default CanceledStatus