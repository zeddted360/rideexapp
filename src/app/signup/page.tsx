import Signup from "@/components/Signup";

export const metadata = {
  title: "Sign Up",
  description:
    "Create your account to start ordering delicious food from RideEx Food Ordering App.",
  openGraph: {
    title: "Sign Up | RideEx Food Ordering App",
    description:
      "Create your account to start ordering delicious food from RideEx Food Ordering App.",
    url: "/signup",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up | RideEx Food Ordering App",
    description:
      "Create your account to start ordering delicious food from RideEx Food Ordering App.",
  },
};

export default async function SignupPage() {
  return <Signup />;
}
