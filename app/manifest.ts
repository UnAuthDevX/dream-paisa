import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DreamPaisa - Personal Finance & Net Worth Tracker",
    short_name: "DreamPaisa",
    description: "Track income, expenses, bank accounts, assets with depreciation, and investments all in one unified personal finance app.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    categories: ["finance", "productivity", "utilities"],
    background_color: "#ffffff",
    theme_color: "#2563eb",

    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}