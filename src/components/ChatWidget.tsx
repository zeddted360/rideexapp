"use client"
import { useEffect } from "react";

export default function ChatWidget() {
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).tawktoLoaded) {
      const script = document.createElement("script");
      script.src = "https://embed.tawk.to/6876e0267ff1db1914589d13/1j085n701";
      script.async = true;
      script.setAttribute("crossorigin", "*");
      document.body.appendChild(script);
      (window as any).tawktoLoaded = true;

      // Move widget up with custom CSS after it loads
      script.onload = () => {
        const style = document.createElement("style");
        style.innerHTML = `
          @media (max-width: 768px) {
            #tawkchat-container, #tawkchat-minified-container, .tawk-min-container, .tawk-mobile-bottom-right {
              bottom: 20px !important;
            }
          }
        `;
        document.head.appendChild(style);
      };
    }
  }, []);
  return null;
} 