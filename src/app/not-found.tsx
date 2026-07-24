import Link from "next/link";
import { Share2, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--border-glow)] blur-[120px]" />
      </div>

      <div className="relative text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Share2 size={28} className="text-white" />
          </div>
        </div>

        <h1 className="text-6xl font-extrabold text-[var(--text-main)] mb-2">404</h1>
        <p className="text-lg text-[var(--text-muted)] mb-2 font-medium">This space doesn&apos;t exist</p>
        <p className="text-sm text-[var(--text-subtle)] mb-8 font-medium">The slug may have been renamed or never created.</p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
            bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold
            transition-all duration-200 shadow-md active:scale-[0.97]"
        >
          <ArrowLeft size={15} />
          Create your own space
        </Link>
      </div>
    </div>
  );
}
