
import React from 'react'
import { motion } from "framer-motion";
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const ErrorState = ({error}:{error:string}) => {
    const router = useRouter();
  return (
       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
         <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           className="text-center space-y-6 max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
         >
           <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
             <XCircle className="w-10 h-10 text-red-500" />
           </div>
           <div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
               Error Loading Order
             </h3>
             <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
           </div>
           <Button
             onClick={() => router.push("/myorders")}
             className="w-full bg-orange-500 hover:bg-orange-600"
           >
             Back to Orders
           </Button>
         </motion.div>
       </div>
     );
}

export default ErrorState