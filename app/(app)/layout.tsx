import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex flex-col pt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}
