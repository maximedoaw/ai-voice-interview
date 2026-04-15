import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-100 py-32 px-6 mt-auto">
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-start gap-20">
        <div className="flex-1 space-y-12 max-w-sm">
           <div className="font-black text-3xl tracking-tighter text-green-950">
             AI INTERVIEW<span className="text-green-600">.</span>
           </div>
           <p className="text-zinc-500 font-medium leading-relaxed font-outfit">
             Une architecture pédagogique immersive par la voix pour transformer vos hésitations en convictions durables.
           </p>
           <div className="flex gap-6 opacity-40">
              <Link href="#" className="w-10 h-10 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-950 hover:bg-green-50 hover:text-green-900 transition-all font-black text-[10px]">T1</Link>
              <Link href="#" className="w-10 h-10 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-950 hover:bg-green-50 hover:text-green-900 transition-all font-black text-[10px]">L1</Link>
              <Link href="#" className="w-10 h-10 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-950 hover:bg-green-50 hover:text-green-900 transition-all font-black text-[10px]">D1</Link>
           </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-16 flex-none md:w-2/3">
           <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-green-900 opacity-30">Exploration</h4>
              <nav className="flex flex-col gap-5 text-zinc-500 font-bold text-xs uppercase tracking-widest font-outfit">
                 <Link href="/#features" className="hover:text-green-950 transition-colors">Features</Link>
                 <Link href="/#faq" className="hover:text-green-950 transition-colors">FAQ</Link>
                 <Link href="/history" className="hover:text-green-950 transition-colors">Historique</Link>
              </nav>
           </div>
           <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-green-900 opacity-30">Juridique</h4>
              <nav className="flex flex-col gap-5 text-zinc-500 font-bold text-xs uppercase tracking-widest font-outfit">
                 <Link href="#" className="hover:text-green-950 transition-colors">Confidentialité</Link>
                 <Link href="#" className="hover:text-green-950 transition-colors">Mentions</Link>
                 <Link href="#" className="hover:text-green-950 transition-colors">CGU</Link>
              </nav>
           </div>
           <div className="space-y-8 hidden lg:block">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-green-900 opacity-30">Legal</h4>
              <nav className="flex flex-col gap-1 text-[10px] text-zinc-300 font-medium">
                 <p>© {new Date().getFullYear()} AI INTERVIEW INC.</p>
                 <p>ALL RIGHTS RESERVED.</p>
                 <p>CAMEROUN EDITION.</p>
              </nav>
           </div>
        </div>
      </div>
    </footer>
  )
}
