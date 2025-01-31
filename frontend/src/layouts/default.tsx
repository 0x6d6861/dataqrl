import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbar";
import UtilitySection from "@/components/ui/UtilitySection";
import { Divider } from "@heroui/divider";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      {/* <Navbar /> */}
      <main className="px-6 flex-grow pt-16 flex flex-row items-center">
        <div className="flex-1 h-full">
          {children}
        </div>
        <div className="w-1/3 h-full">
          <UtilitySection />
        </div>
      </main>
      {/* <footer className="w-full flex items-center justify-center py-3">

      </footer> */}
    </div>
  );
}
