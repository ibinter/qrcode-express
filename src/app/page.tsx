import Header from '@/components/layout/Header'
import Hero from '@/components/home/Hero'
import QRGenerator from '@/components/qr/QRGenerator'
import Features from '@/components/home/Features'
import Pricing from '@/components/home/Pricing'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <section id="generateur" className="py-12 px-4 max-w-6xl mx-auto">
        <QRGenerator />
      </section>
      <Features />
      <Pricing />
      <Footer />
    </main>
  )
}
