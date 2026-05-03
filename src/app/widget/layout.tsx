import { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Live Prayer Map Widget",
};

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-transparent m-0 p-0 overflow-hidden w-screen h-screen">
        {children}
      </body>
    </html>
  );
}
