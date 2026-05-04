import SiteNav from '@/components/SiteNav'

export const metadata = { title: 'Privacy Policy — clear the signal' }

export default function PrivacyPage() {
  return (
    <main className="min-h-screen text-white">
      <SiteNav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-medium text-white mb-2">privacy policy</h1>
        <p className="text-xs text-sand/40 tracking-widest mb-12">clear the signal · clearthesignal.com</p>

        <div className="flex flex-col gap-8 text-sm text-sand/70 leading-relaxed">
          <section>
            <p className="text-white/80 mb-3">last updated: May 2025</p>
            <p>clear the signal ("we", "us", or "our") operates clearthesignal.com. This policy describes how we collect, use, and protect information when you use our site.</p>
          </section>

          <section>
            <h2 className="text-white text-base font-medium mb-2">information we collect</h2>
            <p>We collect information you provide when creating an account (email address), and usage data such as videos viewed and tags followed. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-white text-base font-medium mb-2">how we use your information</h2>
            <p>We use your information to operate and improve the service, personalize your experience, and communicate updates. We do not use your data for advertising.</p>
          </section>

          <section>
            <h2 className="text-white text-base font-medium mb-2">third-party services</h2>
            <p>We use Firebase (Google) for authentication and data storage. Videos are sourced from YouTube. We may use Meta APIs for social sharing features. These services have their own privacy policies.</p>
          </section>

          <section>
            <h2 className="text-white text-base font-medium mb-2">data retention</h2>
            <p>You may request deletion of your account and associated data at any time by contacting us at the address below.</p>
          </section>

          <section>
            <h2 className="text-white text-base font-medium mb-2">contact</h2>
            <p>Questions about this policy: <a href="mailto:scott@tonedefapps.com" className="text-periwinkle-light hover:underline">scott@tonedefapps.com</a></p>
          </section>
        </div>
      </div>
    </main>
  )
}
