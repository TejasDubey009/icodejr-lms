import logo from "@/assets/icodejr-logo-light.webp";
import { NAV_LINKS } from "./navLinks";
import { SALES_WHATSAPP, formatPhoneDisplay, whatsappUrl } from "@/lib/leads";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative">
      <div aria-hidden className="divider-fade" />
      <div className="mx-auto grid max-w-page gap-10 px-4 py-14 sm:px-6 md:grid-cols-12 lg:px-8">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="iCodeJr" width={320} height={159} className="h-9 w-auto" loading="lazy" />
            <span className="rounded-full border border-rule-strong px-2 py-0.5 font-display text-[11px] font-medium tracking-wide text-ink-2">
              LMS
            </span>
          </div>
          <p className="mt-5 max-w-[38ch] text-[14px] leading-relaxed text-ink-2">
            The operations platform for academies that teach live online classes.
          </p>
        </div>
        <nav aria-label="Footer" className="md:col-span-4">
          <p className="meta">On this page</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-6">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="inline-block py-1.5 text-[14px] text-ink-2 hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="meta">Talk to us</p>
          <ul className="mt-3 text-[14px]">
            <li>
              <a href="#demo" className="inline-block py-1.5 text-ink-2 hover:text-ink">
                Book a demo
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl("Hi iCodeJr team, I'd like to learn more about iCodeJr LMS for my academy.")}
                target="_blank"
                rel="noopener noreferrer"
                className="num inline-block py-1.5 text-ink-2 hover:text-ink"
              >
                WhatsApp {formatPhoneDisplay(SALES_WHATSAPP)}
              </a>
            </li>
          </ul>
        </div>
      </div>
      {/* Oversized outline wordmark, fading into the page */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <p className="wordmark whitespace-nowrap text-center font-display text-[clamp(3.5rem,15.5vw,13rem)] font-semibold leading-[0.9] tracking-tight">
          iCodeJr LMS
        </p>
      </div>
      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-3 px-4 py-5 text-caption text-ink-3 sm:px-6 lg:px-8">
          <p>
            © <span className="num">{year}</span> iCodeJr, a brand of Cognify Labs.
          </p>
          <p>Sample names and figures in the product screens are illustrative.</p>
          <a href="#top" className="inline-block py-1.5 text-ink-2 hover:text-ink">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
