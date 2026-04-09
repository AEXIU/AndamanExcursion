// layout.tsx - with automatic loading bar
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import localFont from "next/font/local";
import clsx from "clsx";
import "./globals.css";
import "@/styles/variables.css";
import { TopLoadingBarProvider } from "@/components/layout/TopLoadingBarProvider/TopLoadingBarProvider";
import { Footer, Header } from "@/components/organisms";
import { Container } from "@/components/layout";
import { PageBackgroundProvider } from "@/components/atoms/PageBackgroundProvider/PageBackgroundProvider";
import { ReactQueryProvider } from "@/context/ReactQueryProvider";
import { getNavigationData } from "@/utils/getNavigationData";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com";

export const metadata: Metadata = {
  title: "Andaman Excursion | Explore the Andaman Islands",
  metadataBase: new URL(baseUrl),
  publisher: "Andaman Excursion",
  authors: [{ name: "Andaman Excursion", url: "https://andamanexcursion.com" }],
  creator: "Andaman Excursion",
  description:
    "Discover pristine beaches, hidden adventures, and unforgettable experiences across the Andaman Islands with our perfectly designed travel packages.",
  keywords: [
    "Andaman Islands",
    "travel packages",
    "island vacation",
    "beach holiday",
    "scuba diving",
    "Andaman tourism",
  ],
  openGraph: {
    title: "Andaman Excursion | Explore the Andaman Islands",
    description:
      "Discover pristine beaches, hidden adventures, and unforgettable experiences across the Andaman Islands with our perfectly designed travel packages.",
    url: "https://andamanexcursion.com",
    siteName: "Andaman Excursion",
    locale: "en_US",
    type: "website",
  },
  other: {
    "og:type": "website",
    "business:contact_data:locality": "Andaman and Nicobar Islands",
    "business:contact_data:region": "India",
  },
};

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const quickBeach = localFont({
  src: [
    {
      path: "../../../public/fonts/quick-beach.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-quick-beach",
  display: "swap",
  preload: true,
  fallback: ["cursive", "fantasy", "serif"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch data server-side
  const navItems = await getNavigationData(); // get navigation data from payload

  return (
    <html
      lang="en"
      className={`${quicksand.className} ${quickBeach.variable}`}
    >
      <head>
        {/* Preload critical fonts for Safari */}
        <link
          rel="preload"
          href="/fonts/quick-beach.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={clsx(quicksand.className, quickBeach.className)}>
        <TopLoadingBarProvider>
          <ReactQueryProvider>
            <Header navItems={navItems} />
            <PageBackgroundProvider>
              <Container>
                <div className="main-content">{children}</div>
              </Container>
            </PageBackgroundProvider>
            <Footer />
          </ReactQueryProvider>
        </TopLoadingBarProvider>
      </body>
    </html>
  );
}
