import FabNav from "@/components/user/FabNav";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 w-full max-w-md mx-auto bg-[#FAF8F5] min-h-screen shadow-2xl overflow-hidden flex flex-col relative">
      {children}
      <FabNav />
    </div>
  );
}
