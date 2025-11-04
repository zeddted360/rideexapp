import React from 'react';
import HistoryClient from '@/components/HistoryClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "History | RideEx",
  description: "View your order history and notifications",
  keywords: ["history", "orders", "notifications", "food delivery", "tracking"],
  openGraph: {
    title: "Order History | RideEx",
    description: "Track your food orders and view notification history",
    type: "website",
  },
};

const HistoryPage = () => {
  return <HistoryClient />;
};

export default HistoryPage;