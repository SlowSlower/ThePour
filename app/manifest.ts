import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ThePour",
    short_name: "ThePour",
    description: "와인·위스키 시음 기록",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf6ec",
    theme_color: "#7c2d12",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
