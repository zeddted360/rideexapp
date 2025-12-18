"use client";

import { useEffect } from "react";

export default function ChatWidget() {
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).tawktoLoaded) {
      (window as any).Tawk_API = (window as any).Tawk_API || {};
      (window as any).Tawk_LoadStart = new Date();

      // Hide the widget as soon as tawk.to loads
      (window as any).Tawk_API.onLoad = function () {
        (window as any).Tawk_API.hideWidget();
      };

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://embed.tawk.to/69431ea463447e19862c0b9a/1jcn2vdlk";
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");

      const firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode?.insertBefore(script, firstScript);

      (window as any).tawktoLoaded = true;

      // Your mobile positioning fix
      script.onload = () => {
        const style = document.createElement("style");
        style.innerHTML = `
          @media (max-width: 768px) {
            #tawkchat-container,
            #tawkchat-minified-container,
            .tawk-min-container,
            .tawk-mobile-bottom-right {
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
