import logo from "@/assets/icodejr-logo.png";
import { NAV_LINKS } from "./navLinks";
import { SALES_WHATSAPP, formatPhoneDisplay, whatsappUrl } from "@/lib/leads";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-rule bg-canvas">
      <div className="mx-auto grid max-w-page gap-10 px-4 py-14 sm:px-6 md:grid-cols-12 lg:px-8">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="iCodeJr" width={92} height={46} className="h-8 w-auto" loading="lazy" />
            <span className="border-l border-rule-strong pl-2.5 font-mono text-[12px] font-medium tracking-[0.08em] text-ink-2">
              LMS
            </span>
          </div>
          <p className="mt-5 max-w-[38ch] text-[14px] leading-relaxed text-ink-2">
            The operations platform for academies that teach live online classes.
          </p>
        </div>
        <nav aria-label="Footer" className="md:col-span-4">
          <p className="meta">On this page</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-[14px] text-ink-2 hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="meta">Talk to us</p>
          <ul className="mt-4 space-y-2.5 text-[14px]">
            <li>
              <a href="#demo" className="text-ink-2 hover:text-ink">
                Book a demo
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl("Hi iCodeJr team, I'd like to learn more about iCodeJr LMS for my academy.")}
                target="_blank"
                rel="noopener noreferrer"
                className="num text-ink-2 hover:text-ink"
              >
                WhatsApp {formatPhoneDisplay(SALES_WHATSAPP)}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-3 px-4 py-5 text-caption text-ink-3 sm:px-6 lg:px-8">
          <p>
            © <span className="num">{year}</span> iCodeJr, a brand of Cognify Labs.
          </p>
          <p>Sample names and figures on this page are illustrative.</p>
        </div>
      </div>
    </footer>
  );
}
