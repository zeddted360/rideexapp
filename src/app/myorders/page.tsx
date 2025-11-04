import React from 'react'
import MyOrders from "@/components/MyOrders/MyOrders";

export const metadata = {
  title: "My Orders | RideEx",
  description: "Track your food orders and delivery status",
};

const page = () => {
  return <MyOrders />
}

export default page