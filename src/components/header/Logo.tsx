// components/Header/Logo.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";

const Logo = () => {
  return (
    <div className="flex items-center md:mr-4">
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <div className="relative w-12 h-12 lg:w-16 lg:h-16">
          <Image
            src="/RideEx_Logo.jpg"
            alt="RideEx Logo"
            fill
            priority
            quality={100}
            className="object-contain rounded-full shadow-md"
          />
        </div>
      </Link>
    </div>
  );
};

export default Logo;