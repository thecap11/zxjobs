import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "zxjobs",
  description: "AI-powered job matching platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${jakarta.variable}`} style={{ colorScheme: "dark" }}>
      <body className="font-sans antialiased bg-black text-foreground min-h-screen flex flex-col relative selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
        {/* Abstract Dark UI Background */}
        <div className="fixed inset-0 z-[-1] bg-black">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f20_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f20_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[150px]" />
        </div>
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col relative z-0 pt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
