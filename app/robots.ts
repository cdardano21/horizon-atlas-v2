import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/profile", "/login", "/signup"],
    },
    sitemap: "https://www.destinationfinderai.com/sitemap.xml",
  };
}
