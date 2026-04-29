import Link from 'next/link'
import { HorizontalLockup } from './SpiralIcon'
import { InstagramIcon, RedditIcon, DiscordIcon } from './SocialIcons'

const SOCIALS = [
  {
    label: 'instagram',
    href: 'https://www.instagram.com/clearthesignal',
    icon: <InstagramIcon size={30} />,
    active: true,
  },
  {
    label: 'reddit',
    href: 'https://www.reddit.com/r/clearthesignal/',
    icon: <RedditIcon size={30} />,
    active: true,
  },
  {
    label: 'discord',
    href: null,
    icon: <DiscordIcon size={30} />,
    active: false,
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-periwinkle/15 px-6 pt-16 pb-10">
      <div className="max-w-4xl mx-auto">

        {/* main row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-10 mb-12">

          {/* brand */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <HorizontalLockup height={44} />
            <p className="text-sand/40 text-sm leading-relaxed max-w-[260px] text-center sm:text-left">
              curated daily for those paying attention.<br />no algorithm. no agenda. no noise.
            </p>
          </div>

          {/* socials */}
          <div className="flex items-center gap-10">
            {SOCIALS.map(s =>
              s.active ? (
                <a
                  key={s.label}
                  href={s.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`clear the signal on ${s.label}`}
                  className="flex flex-col items-center gap-2.5 text-sand/50 hover:text-desert-sky transition-colors group"
                >
                  <span className="group-hover:scale-110 transition-transform duration-150">{s.icon}</span>
                  <span className="text-xs tracking-widest text-sand/35 group-hover:text-desert-sky/70 transition-colors">{s.label}</span>
                </a>
              ) : (
                <div
                  key={s.label}
                  title="coming soon"
                  className="flex flex-col items-center gap-2.5 text-sand/20 cursor-default relative group"
                >
                  <span>{s.icon}</span>
                  <span className="text-xs tracking-widest text-sand/20">{s.label}</span>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-mesa-light border border-periwinkle/20 text-xs text-sand/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    coming soon
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* bottom bar */}
        <div className="border-t border-periwinkle/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/signal" className="text-xs text-sand/35 hover:text-sand/60 transition-colors tracking-wide">
              dispatch
            </Link>
            <Link href="/about" className="text-xs text-sand/35 hover:text-sand/60 transition-colors tracking-wide">
              about
            </Link>
            <a
              href="https://discord.gg/placeholder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sand/35 hover:text-sand/60 transition-colors tracking-wide"
            >
              community
            </a>
          </div>
          <p className="text-sand/20 text-xs tracking-widest">
            clear the signal · {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </footer>
  )
}
