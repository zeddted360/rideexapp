import React from 'react'
import MenuClient from './MenuClient'

export const metadata = {
  title: "Menu",
  description:
    "Browse the full menu and order your favorite dishes from RideEx Food Ordering App.",
  openGraph: {
    title: "Menu | RideEx Food Ordering App",
    description:
      "Browse the full menu and order your favorite dishes from RideEx Food Ordering App.",
    url: "/menu",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu | RideEx Food Ordering App",
    description:
      "Browse the full menu and order your favorite dishes from RideEx Food Ordering App.",
  },
};

const page = () => {
  return (
   <MenuClient/>
  )
}

export default page