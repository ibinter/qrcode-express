import Header from '@/components/layout/Header'
import Hero from '@/components/home/Hero'
import StatsBar from '@/components/home/StatsBar'
import ShowcaseSlider from '@/components/home/ShowcaseSlider'
import QRGenerator from '@/components/qr/QRGenerator'
import Features from '@/components/home/Features'
import HowItWorks from '@/components/home/HowItWorks'
import Pricing from '@/components/home/Pricing'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <StatsBar />
      <ShowcaseSlider />
      <section id="generateur" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-3">
              Créez votre QR maintenant
            </h2>
            <p className="text-gray-500 text-lg">Gratuit, sans inscription, sans filigrane</p>
          </div>
          <QRGenerator />
        </div>
      </section>
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </main>
  )
}
