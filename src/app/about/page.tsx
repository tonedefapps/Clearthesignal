import Link from 'next/link'
import { HorizontalLockup, SpiralIcon } from '@/components/SpiralIcon'
import AuthStatus from '@/components/AuthStatus'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'about — clear the signal',
  description: 'clear the signal is a free, community-powered platform dedicated to the positive exploration of human consciousness, synchronicity, contact phenomena, and collective evolution.',
}

const beliefs = [
  {
    heading: 'energy is the medium',
    body: 'every sense you have is a transducer of energy. every instrument that has ever measured something real is measuring energy in some form. the phenomena this community cares about most are energy phenomena. and energy doesn\'t lie.',
  },
  {
    heading: 'the pattern already exists',
    body: 'the spiral was always in the stars. we\'re not inventing a new conversation — we\'re clearing enough noise to see the one that\'s been there all along.',
  },
  {
    heading: 'radical positivity is a choice',
    body: 'there is enough fear in this space. we are not adding to it. every piece of content we surface is chosen because it expands rather than contracts, connects rather than isolates, opens rather than closes.',
  },
  {
    heading: 'you\'re not alone in this',
    body: 'whatever you\'ve noticed. whatever you\'ve experienced. whatever question won\'t leave you alone. there is a community of people having the same conversation — carefully, seriously, with open minds and grounded hearts.',
  },
]

const principles = [
  { label: 'free. always.', body: 'no paywalls. no premium tiers. no content locked behind a subscription. the signal is for everyone or it\'s for no one.' },
  { label: 'transparent. completely.', body: 'we publish our curation criteria. we explain our scoring. we name our sources. we don\'t hide the machine.' },
  { label: 'positive. deliberately.', body: 'positivity is not naivety. it is a choice we make every single day about what we amplify and what we let pass.' },
  { label: 'grounded. credibly.', body: 'we lean on evidence, experience, and credible voices. we require intellectual honesty. always.' },
  { label: 'human. warmly.', body: 'this community is made of people who have often felt alone in what they notice and believe. nobody should feel alone here.' },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-mesa text-white">

      {/* nav */}
      <nav className="border-b border-periwinkle/20 px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <HorizontalLockup height={36} />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-sand/50 hover:text-desert-sky transition-colors">
            feed
          </Link>
          <Link href="/about" className="text-sm text-periwinkle-light">
            about
          </Link>
          <AuthStatus />
        </div>
      </nav>

      {/* hero */}
      <section className="relative overflow-hidden border-b border-periwinkle/15 px-6 py-24 text-center">
        {/* starfield */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: [
              'radial-gradient(1px 1px at 15% 20%, rgba(212,196,168,0.18) 0%, transparent 100%)',
              'radial-gradient(1px 1px at 32% 8%,  rgba(212,196,168,0.14) 0%, transparent 100%)',
              'radial-gradient(1px 1px at 55% 18%, rgba(212,196,168,0.20) 0%, transparent 100%)',
              'radial-gradient(1px 1px at 72% 5%,  rgba(212,196,168,0.14) 0%, transparent 100%)',
              'radial-gradient(1px 1px at 88% 22%, rgba(212,196,168,0.18) 0%, transparent 100%)',
              'radial-gradient(1px 1px at 8%  65%, rgba(212,196,168,0.12) 0%, transparent 100%)',
              'radial-gradient(1px 1px at 95% 60%, rgba(212,196,168,0.13) 0%, transparent 100%)',
              'radial-gradient(1.5px 1.5px at 40% 35%, rgba(168,196,224,0.35) 0%, transparent 100%)',
              'radial-gradient(1.5px 1.5px at 68% 42%, rgba(168,196,224,0.28) 0%, transparent 100%)',
              'radial-gradient(1.5px 1.5px at 22% 55%, rgba(168,196,224,0.32) 0%, transparent 100%)',
            ].join(', '),
          }}
        />

        <div className="relative max-w-2xl mx-auto">
          <div className="flex justify-center mb-8">
            <SpiralIcon size={64} />
          </div>

          <h1 className="text-5xl font-medium text-desert-sky mb-2 tracking-tight">
            you&rsquo;re not imagining it.
          </h1>

          <p className="text-xl font-light text-sand/60 tracking-widest mt-4 mb-10">
            signal through the noise.
          </p>

          <p className="text-lg text-white/80 leading-relaxed max-w-xl mx-auto">
            something is shifting. you feel it in the synchronicities you&rsquo;ve started noticing.
            in the conversations that keep finding you. in the questions that won&rsquo;t leave you
            alone no matter how many times you try to set them down.
          </p>

          <p className="text-lg text-white/80 leading-relaxed max-w-xl mx-auto mt-4">
            you&rsquo;re not alone in this. not even close.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col gap-20">

        {/* mission */}
        <section>
          <p className="text-lg text-white leading-relaxed border-l-2 border-periwinkle/40 pl-6">
            clear the signal is a free, community-powered platform dedicated to the positive
            exploration of human consciousness, synchronicity, contact phenomena, and collective
            evolution. we curate the signal from the noise — surfacing credible voices, real
            research, and genuine experience from a community of people who are quietly, seriously
            asking the biggest questions available to a human being.{' '}
            <span className="text-desert-sky">no fear. no fringe. no upsell.</span>{' '}
            just signal.
          </p>
        </section>

        {/* why we built this */}
        <section>
          <h2 className="text-2xl font-medium text-periwinkle-light mb-6">why we built this</h2>
          <div className="flex flex-col gap-4 text-white/80 leading-relaxed">
            <p>
              three friends. almost forty years. one conversation in sedona that became something
              we couldn&rsquo;t walk away from.
            </p>
            <p>
              we&rsquo;d all been following this space for years — the research, the voices, the
              events, the experiences. we believed in it. we still do. but we kept running into
              the same problem: for every piece of content that genuinely moved the conversation
              forward, there were twenty more that recycled the same events, leaned into fear,
              or existed primarily to sell you something.
            </p>
            <p>the signal was there. it was just buried.</p>
            <p>
              so we built a filter. and then we built a home for the people who wanted to find
              what the filter was surfacing.
            </p>
            <p className="text-desert-sky font-medium">that&rsquo;s clear the signal.</p>
          </div>
        </section>

        {/* what we do */}
        <section>
          <h2 className="text-2xl font-medium text-periwinkle-light mb-6">what we do</h2>
          <div className="flex flex-col gap-4 text-white/80 leading-relaxed">
            <p>
              we watch the full landscape of content across consciousness research, uap phenomena,
              synchronicity, manifestation, healing, and collective evolution. we score it. we
              filter it. we surface what&rsquo;s actually moving the conversation forward — new
              information, credible voices, genuine experience — and we let everything else pass.
            </p>
            <p>
              the scoring is transparent. the criteria are published. the curation is human,
              not algorithmic.
            </p>
            <p className="text-red-rock font-medium">what comes through is signal.</p>
          </div>
        </section>

        {/* what we believe */}
        <section>
          <h2 className="text-2xl font-medium text-periwinkle-light mb-8">what we believe</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {beliefs.map(b => (
              <div
                key={b.heading}
                className="bg-mesa-light border border-periwinkle/20 rounded-2xl p-6"
              >
                <h3 className="text-base font-medium text-desert-sky mb-2">{b.heading}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* principles */}
        <section>
          <h2 className="text-2xl font-medium text-periwinkle-light mb-8">our principles</h2>
          <div className="flex flex-col gap-3">
            {principles.map(p => (
              <div
                key={p.label}
                className="flex gap-4 bg-mesa-light border border-periwinkle/15 rounded-xl px-6 py-4"
              >
                <span className="text-sm font-medium text-desert-sky whitespace-nowrap pt-0.5 min-w-[160px]">
                  {p.label}
                </span>
                <p className="text-sm text-white/70 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* what we will never do */}
        <section>
          <h2 className="text-2xl font-medium text-periwinkle-light mb-6">what we will never do</h2>
          <div className="flex flex-col gap-4 text-white/80 leading-relaxed">
            <p>
              clear the signal will always be free. no paywalls. no premium tiers. no content
              locked behind a subscription. the signal is for everyone or it&rsquo;s for no one.
            </p>
            <p>
              we will never amplify fear, unfalsifiable claims, or content designed to divide.
              we will never monetize your trust. we will never optimize for engagement over truth.
            </p>
            <p className="text-sand/60 text-sm">
              if something doesn&rsquo;t belong here, it doesn&rsquo;t get in. that&rsquo;s the whole job.
            </p>
          </div>
        </section>

        {/* invitation */}
        <section className="text-center py-8 border-t border-periwinkle/15">
          <div className="flex justify-center mb-8">
            <SpiralIcon size={48} />
          </div>
          <h2 className="text-3xl font-medium text-periwinkle-light mb-6">the invitation</h2>
          <div className="flex flex-col gap-3 text-white/80 leading-relaxed max-w-lg mx-auto mb-10">
            <p>you don&rsquo;t have to explain yourself here.</p>
            <p>
              you don&rsquo;t have to qualify your experiences or defend your curiosity. you
              don&rsquo;t have to pretend you haven&rsquo;t noticed what you&rsquo;ve noticed.
              you don&rsquo;t have to be certain — about any of it.
            </p>
            <p>you just have to be willing to look.</p>
          </div>
          <p className="text-lg mb-1">
            <span className="text-desert-sky">clear the signal.</span>{' '}
            <span className="text-red-rock">find your frequency.</span>
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link
              href="/"
              className="bg-periwinkle hover:bg-periwinkle-light text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors"
            >
              browse the feed
            </Link>
            <Link
              href="/auth"
              className="bg-transparent border border-desert-sky/40 hover:border-desert-sky/70 text-desert-sky text-sm font-medium px-6 py-3 rounded-xl transition-colors"
            >
              join the community
            </Link>
          </div>
        </section>

      </div>

      <Footer />

    </main>
  )
}
