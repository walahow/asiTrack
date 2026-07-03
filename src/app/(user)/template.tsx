export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in-up w-full flex flex-col flex-1 min-h-full">
      {children}
    </div>
  );
}
