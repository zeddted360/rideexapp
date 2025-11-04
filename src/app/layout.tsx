import "./globals.css";
import { Wrapper } from "@/Providers/Wrapper";
import { Metadata } from "next";
// import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "RideEx",
  description: "Your trusted food delivery platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Wrapper>
      {children}
      {/* <ChatWidget /> */}
    </Wrapper>
  );
}
