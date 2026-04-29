import { CONTACT_MAILTO } from "@/lib/constants";

export function Footer() {
  return (
    <footer id="footer" className="border-t border-hairline mt-32">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-[14px]">
        <div>
          <div className="font-display text-2xl text-sand mb-3">ZeusBot</div>
          <p className="font-display text-bronze-up text-[15px] leading-snug">
            A fleet, on a throne, in your business.
          </p>
        </div>
        <div>
          <div className="eyebrow mb-3">Product</div>
          <ul className="space-y-2 text-bronze-up">
            <li><a href="#capabilities" className="hover:text-sand">Capabilities</a></li>
            <li><a href="#how-it-works" className="hover:text-sand">How it works</a></li>
            <li><a href="#pricing" className="hover:text-sand">Pricing</a></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-3">Company</div>
          <ul className="space-y-2 text-bronze-up">
            <li><a href="/about/" className="hover:text-sand">About</a></li>
            <li><a href={CONTACT_MAILTO} className="hover:text-sand">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-3">Contact</div>
          <a
            href={CONTACT_MAILTO}
            className="text-sand hover:text-gold-orb transition-colors"
          >
            Request demo
          </a>
        </div>
      </div>
      <div className="border-t border-hairline">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-6 text-[13px] text-tan flex justify-between flex-wrap gap-3">
          <span>© 2026 ZeusBot — built by humans + agents.</span>
          <span className="font-mono uppercase tracking-[0.06em] text-[11px]">v1.0</span>
        </div>
      </div>
    </footer>
  );
}
