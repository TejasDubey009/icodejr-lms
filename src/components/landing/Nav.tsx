import { lazy, Suspense, useEffect, useState } from "react";
import { m, useScroll, useSpring } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import logo from "@/assets/icodejr-logo-light.webp";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "./navLinks";
import { useActiveSection } from "@/hooks";

const SECTION_IDS = NAV_LINKS.map((l) => l.href.slice(1));

// The ⌘K menu and its library load the first time it is opened
const CommandMenu = lazy(() => import("./CommandMenu"));

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeId = useActiveSection(SECTION_IDS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  const openMenu = () => {
    setMenuLoaded(true);
    setMenuOpen(true);
  };

  // ⌘K / Ctrl+K anywhere on the page
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMenuLoaded(true);
        setMenuOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      {/* Floating pill bar */}
      <div
        className={cn(
          "relative mx-auto max-w-page overflow-hidden border border-rule-strong/50 backdrop-blur-xl transition-[background-color,box-shadow] duration-200",
          open ? "rounded-[28px]" : "rounded-full",
          scrolled || open
            ? "bg-[rgb(12_25_50/0.9)] shadow-[0_12px_40px_-16px_rgb(0_0_0/0.7)]"
            : "bg-[rgb(15_31_61/0.6)]",
        )}
      >
        {/* How far down the page you are */}
        <m.span
          aria-hidden
          style={{ scaleX: progress }}
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-brand via-grape to-sun"
        />
        <div className="flex h-14 items-center justify-between gap-2 pl-4 pr-2 sm:h-16 sm:gap-4 sm:pl-7 sm:pr-2.5">
          <a href="#top" className="flex shrink-0 items-center gap-2.5" aria-label="iCodeJr LMS, back to top">
            <img src={logo} alt="iCodeJr" width={320} height={159} className="h-8 w-auto sm:h-9" />
            <span className="hidden rounded-full border border-rule-strong px-2 py-0.5 font-display text-[11px] font-medium tracking-wide text-ink-2 min-[400px]:inline">
              LMS
            </span>
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {NAV_LINKS.map((l) => {
                const current = activeId === l.href.slice(1);
                return (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      aria-current={current ? "location" : undefined}
                      className={cn(
                        "relative block py-2 font-display text-[15px] transition-colors hover:text-ink",
                        current ? "text-ink" : "text-ink-2",
                      )}
                    >
                      {l.label}
                      {current && (
                        <m.span
                          aria-hidden
                          layoutId="nav-underline"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-sun"
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openMenu}
              onPointerEnter={() => setMenuLoaded(true)}
              aria-label="Open quick navigation"
              className="btn-quiet hidden h-11 items-center gap-2 rounded-full pl-3.5 pr-2.5 text-[13.5px] text-ink-2 transition-colors hover:text-ink xl:inline-flex"
            >
              <Search className="h-4 w-4" aria-hidden />
              Search
              <kbd className="rounded-md border border-rule-strong px-1.5 py-0.5 font-sans text-[11px] text-ink-3">⌘K</kbd>
            </button>
            <a href="#demo" className="btn btn-primary btn-sm px-4 sm:h-11 sm:px-6 sm:text-[15px]" onClick={() => setOpen(false)}>
              Book a demo
            </a>
            <button
              type="button"
              className="btn-quiet inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden"
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
          <nav id="mobile-nav" aria-label="Mobile" className="border-t border-rule px-5 pb-3 lg:hidden">
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex h-12 items-center border-b border-rule font-display text-[15px] text-ink last:border-0"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      {menuLoaded && (
        <Suspense fallback={null}>
          <CommandMenu open={menuOpen} onOpenChange={setMenuOpen} />
        </Suspense>
      )}
    </header>
  );
}
