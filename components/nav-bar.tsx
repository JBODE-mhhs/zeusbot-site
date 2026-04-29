import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CONTACT_MAILTO } from "@/lib/constants";

export function NavBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[var(--z-overlay)] bg-gradient-to-b from-ink-deep/80 to-transparent backdrop-blur-[2px]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link
          href="/"
          aria-label="ZeusBot home"
          className="font-display text-xl text-sand hover:text-gold-orb transition-colors"
        >
          ZeusBot
        </Link>
        <a
          href={CONTACT_MAILTO}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Request demo
        </a>
      </div>
    </header>
  );
}
