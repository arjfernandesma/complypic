import type { Metadata } from "next"
import { HomePage } from "@/components/home-page"

export const metadata: Metadata = {
  title: "Free Passport Photo & Compliance Image Tool | ComplyPic",
  description:
    "Resize any photo to exact passport, visa, Amazon, LinkedIn or Instagram specs — correct dimensions, DPI, format and file size. Free. No sign-up required.",
  openGraph: {
    title: "Free Passport Photo & Compliance Image Tool | ComplyPic",
    description:
      "Resize any photo to exact passport, visa, Amazon, LinkedIn or Instagram specs — correct dimensions, DPI, format and file size. Free. No sign-up required.",
    url: "https://complypic.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Passport Photo & Compliance Image Tool | ComplyPic",
    description:
      "Resize any photo to exact passport, visa, Amazon, LinkedIn or Instagram specs — correct dimensions, DPI, format and file size. Free. No sign-up required.",
  },
}

export default function Page() {
  return <HomePage />
}
