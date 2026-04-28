import { InstagramIcon, RedditIcon, DiscordIcon } from './SocialIcons'

const SOCIALS = [
  {
    label: 'instagram',
    href: 'https://www.instagram.com/clearthesignal',
    icon: <InstagramIcon size={28} />,
    active: true,
  },
  {
    label: 'reddit',
    href: 'https://www.reddit.com/r/clearthesignal/',
    icon: <RedditIcon size={28} />,
    active: true,
  },
  {
    label: 'discord',
    href: null,
    icon: <DiscordIcon size={28} />,
    active: false,
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-periwinkle/15 px-6 py-12">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">

        {/* social icons */}
        <div className="flex items-center gap-10">
          {SOCIALS.map(s =>
            s.active ? (
              <a
                key={s.label}
                href={s.href!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`clear the signal on ${s.label}`}
                className="flex flex-col items-center gap-2 text-sand/60 hover:text-desert-sky transition-colors group"
              >
                <span className="group-hover:scale-110 transition-transform duration-150">{s.icon}</span>
                <span className="text-xs tracking-widest text-sand/40 group-hover:text-desert-sky/70 transition-colors">{s.label}</span>
              </a>
            ) : (
              <div
                key={s.label}
                title="coming soon"
                className="flex flex-col items-center gap-2 text-sand/20 cursor-default relative group"
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

        {/* tagline */}
        <p className="text-red-rock/50 text-xs tracking-widest text-center">
          clear the signal · curated, not algorithmic · no fear, no fringe, no upsell
        </p>

      </div>
    </footer>
  )
}
