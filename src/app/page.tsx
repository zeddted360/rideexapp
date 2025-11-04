import HomeClient from '@/components/Home'
import React from 'react'

export const metadata = {
  title: "Home",
  description:
    "Order delicious food from your favorite restaurants. Fast delivery, easy ordering, and great offers await you!",
  openGraph: {
    title: "Home | RideEx Food Ordering App",
    description:
      "Order delicious food from your favorite restaurants. Fast delivery, easy ordering, and great offers await you!",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Home | RideEx Food Ordering App",
    description:
      "Order delicious food from your favorite restaurants. Fast delivery, easy ordering, and great offers await you!",
  },
};

const HomePage = () => {
  return (
    <>
      <HomeClient />
    </>
  );
}

export default HomePage