import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://learnhub.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/courses/", "/courses"],
        disallow: [
          "/instructor/",
          "/student/",
          "/admin/",
          "/api/",
          "/live/",
          "/payment/",
          "/unauthorized",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
