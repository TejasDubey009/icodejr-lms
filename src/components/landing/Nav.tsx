import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/icodejr-logo.png";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "./navLinks";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        scrolled || open ? "border-rule bg-surface/95 backdrop-blur" : "border-transparent bg-canvas",
      )}
    >
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex shrink-0 items-center gap-2.5" aria-label="iCodeJr LMS, back to top">
          <img src={logo} alt="iCodeJr" width={92} height={46} className="h-8 w-auto" />
          <span className="border-l border-rule-strong pl-2.5 font-mono text-[12px] font-medium tracking-[0.08em] text-ink-2">
            LMS
          </span>
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-[14px] text-ink-2 transition-colors hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a href="#demo" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
            Book a demo
          </a>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rule-strong bg-surface text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-rule bg-surface lg:hidden">
          <ul className="mx-auto max-w-page px-4 py-2 sm:px-6">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center border-b border-rule text-[15px] text-ink last:border-0"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
