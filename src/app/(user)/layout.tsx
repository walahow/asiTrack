import FabNav from "@/components/user/FabNav";
import TimeTravelWidget from "@/components/user/TimeTravelWidget";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 w-full max-w-md mx-auto bg-[#FAF8F5] min-h-screen shadow-2xl overflow-hidden flex flex-col relative">
      {children}
      <FabNav />
      {process.env.NODE_ENV !== "production" && <TimeTravelWidget />}
    </div>
  );
}
