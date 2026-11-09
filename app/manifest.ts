import type { MetadataRoute } from "next";

// Makes the app installable on phones (PWA): "Add to home screen".
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Adunare: tineret",
    short_name: "Adunare",
    description: "Programe, laudă, echipă, voluntari și mesaje pentru liderii de tineret.",
    start_url: "/",
    display: "standalone",
    background_color: "#1d1b3a",
    theme_color: "#1d1b3a",
    lang: "ro",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
