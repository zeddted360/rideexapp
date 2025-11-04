"use client";
import Link from "next/link";
import {
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Info, // For About Us
  HelpCircle, // For FAQ
  FileText, // For Terms and Conditions
  Cookie, // For Cookies
  Lock, // For Privacy Policies
  UserPlus, // For Become a Vendor
  Bike, // For Join as a Rider
  Twitter, // For X (using Twitter icon as a stand-in for X)
  Youtube, // For YouTube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { databases, validateEnv } from "@/utils/appwrite";
import { ID, Query } from "appwrite";
import toast from "react-hot-toast";
import { useAuth } from "@/context/authContext";
import { useTranslation } from "react-i18next";
import ClientOnly from "./ClientOnly";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, role } = useAuth();
  const { t } = useTranslation();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    setLoading(true);
    try {
      // 1. Check if email already exists
      const { newsLetterCollectionId, databaseId } = validateEnv();
      const response = await databases.listDocuments(
        databaseId,
        newsLetterCollectionId,
        [Query.equal("email", email)]
      );
      if (response.documents.length > 0) {
        toast.error("You are already subscribed!");
        setLoading(false);
        return;
      }
      // 2. Save new subscriber
      await databases.createDocument(
        databaseId,
        newsLetterCollectionId,
        ID.unique(),
        { email }
      );
      // 3. Send welcome email
      await fetch("/api/newsletter/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      toast.success(
        "Subscribed successfully! Check your email for a welcome message."
      );
      setEmail("");
    } catch (err) {
      toast.error("Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientOnly>
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.02)_1px,transparent_0)] bg-[length:20px_20px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="relative h-20 w-20 rounded-full overflow-hidden shadow-md">
                <Image
                  src="/RideEx_Logo.jpg"
                  alt="RideEx logo"
                  fill
                  priority
                  quality={100}
                  className="object-fit"
                />
              </div>
              <p className="text-gray-300 leading-relaxed">
                {t("footer.brandDescription")}
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="w-4 h-4 text-orange-400" />
                  <Link href="tel:+2347072087857" className="text-sm">
                    +234 707 208 7857
                  </Link>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-4 h-4 text-orange-400" />
                  <Link
                    href="mailto:support@rideexapp.com?subject=Support Request"
                    className="text-sm"
                  >
                    Support@rideexapp.com
                  </Link>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span className="text-sm">Owerri, Nigeria</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                {t("footer.quickLinks")}
              </h3>
              <ul className="space-y-3">
                {[
                  {
                    href: "/about-us",
                    label: "About Us",
                    icon: <Info className="w-4 h-4" />,
                  },
                  {
                    href: "/FAQ",
                    label: "FAQ",
                    icon: <HelpCircle className="w-4 h-4" />,
                  },
                  {
                    href: "/terms",
                    label: "Terms and Conditions",
                    icon: <FileText className="w-4 h-4" />,
                  },
                  {
                    href: "/cookies",
                    label: "Cookies",
                    icon: <Cookie className="w-4 h-4" />,
                  },
                  {
                    href: "/privacy",
                    label: "Privacy Policies",
                    icon: <Lock className="w-4 h-4" />,
                  },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-300 hover:text-orange-400 transition-all duration-300 group"
                    >
                      <span className="text-sm">{link.icon}</span>
                      <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Let's Do It Together */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                Let's Do It Together
              </h3>
              <ul className="space-y-3">
                {[
                  {
                    href: "/vendor/register",
                    label: "Become a Vendor",
                    icon: <UserPlus className="w-4 h-4 text-orange-400" />,
                  },
                  {
                    href: "/become-a-rider",
                    label: "Join as a Rider",
                    icon: <Bike className="w-4 h-4 text-orange-400" />,
                  },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center space-x-3 text-gray-300 hover:text-orange-400 transition-all duration-300 group"
                    >
                      {item.icon}
                      <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter & Social */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                {t("footer.followUs")}
              </h3>

              {/* Newsletter */}
              <div className="space-y-3">
                <p className="text-sm text-gray-300">
                  Subscribe to our newsletter for exclusive offers and updates.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="relative">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      required
                      placeholder="Enter your email"
                      className="w-full pr-12 pl-4 py-3 bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm backdrop-blur-sm"
                      aria-label="Email for newsletter"
                    />
                    <Button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-2 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 flex items-center justify-center gap-2"
                      aria-label="Subscribe to newsletter"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                          Subscribing...
                        </>
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {emailError && (
                    <p className="text-red-400 text-xs">{emailError}</p>
                  )}
                </form>
              </div>

              {/* Social Media */}
              <div className="space-y-3">
                <p className="text-sm text-gray-300">
                  Follow us on social media
                </p>
                <div className="flex space-x-3">
                  {[
                    {
                      href: "https://www.instagram.com/rideexlogisticsbackup?igsh=MTAwbzRia3BudXI4dg==",
                      Icon: Instagram,
                      label: "Instagram",
                      color: "hover:text-pink-400",
                    },
                    {
                      href: "https://www.facebook.com/share/16nYLmfi26/?mibextid=wwXIfr",
                      Icon: Facebook,
                      label: "Facebook",
                      color: "hover:text-blue-600",
                    },
                    {
                      href: "https://x.com/rideex", // Updated to use "x.com" for X
                      Icon: Twitter, // Using Twitter icon as a stand-in for X
                      label: "X",
                      color: "hover:text-blue-400",
                    },
                    {
                      href: "https://youtube.com/@rideexpresslogistics?si=A3WVHwtNYG9Lqdjg",
                      Icon: Youtube,
                      label: "YouTube",
                      color: "hover:text-red-600", // YouTube's brand color on hover
                    },
                  ].map((social) => (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 ${social.color} group`}
                      aria-label={social.label}
                    >
                      <social.Icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              {/* App Download */}
              <div className="flex flex-col sm:flex-row gap-4">
                <p className="text-sm text-gray-300 font-medium">
                  Download our app
                </p>
                <div className="flex space-x-3">
                  {[
                    {
                      href: "https://play.google.com",
                      label: "Google Play",
                      aria: "Download from Google Play",
                      image: "/play-store.png",
                    },
                    {
                      href: "https://www.apple.com/app-store",
                      label: "App Store",
                      aria: "Download from App Store",
                      image: "/app-store.png",
                    },
                  ].map((store) => (
                    <a
                      onClick={(e) => {
                        e.stopPropagation();
                        window.alert("App coming soon!");
                        return;
                      }}
                      key={store.href}
                      href={"#"}
                      // target="_blank"
                      // rel="noopener noreferrer"
                      className="group"
                    >
                      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
                        <Image
                          src={store.image}
                          alt={store.label}
                          width={24}
                          height={24}
                          className="object-contain w-8 h-auto"
                        />
                        <div className="text-left">
                          <div className="text-xs text-gray-400">
                            Download on
                          </div>
                          <div className="text-sm font-medium text-white">
                            {store.label}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Copyright */}
              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-400">
                <p>© {new Date().getFullYear()} RideEx. All rights reserved.</p>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/privacy"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Terms of Service
                  </Link>
                  {/* Admin Newsletter Link */}
                  {user?.isAdmin && role === "admin" && (
                    <Link
                      href="/admin/newsletter"
                      className="ml-4 text-orange-400 underline hover:text-orange-600 transition-colors font-semibold"
                    >
                      Newsletter Admin
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </ClientOnly>
  );
}