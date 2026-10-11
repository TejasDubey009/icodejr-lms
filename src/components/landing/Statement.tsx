/** One-line promise between the hero and the product tour. */
export default function Statement() {
  return (
    <section className="relative">
      <div aria-hidden className="glow-corners pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-page px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
        <p data-reveal className="mx-auto max-w-[22ch] font-display text-[clamp(1.75rem,1.2rem+2.4vw,2.75rem)] font-medium leading-tight text-ink">
          Give your ops team the one thing they never get, <span className="text-aurora whitespace-nowrap">a quiet evening</span>
        </p>
      </div>
    </section>
  );
}
