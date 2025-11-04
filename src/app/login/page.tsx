import Login from "@/components/Login";

export const metadata = {
  title: "Login",
  description:
    "Login to your RideEx Food Ordering App account to order food and track your orders.",
  openGraph: {
    title: "Login | RideEx Food Ordering App",
    description:
      "Login to your RideEx Food Ordering App account to order food and track your orders.",
    url: "/login",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login | RideEx Food Ordering App",
    description:
      "Login to your RideEx Food Ordering App account to order food and track your orders.",
  },
};

export default function LoginPage() {
  return <Login />;
};
