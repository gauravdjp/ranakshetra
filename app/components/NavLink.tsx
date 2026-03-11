// "use client" needed only because usePathname() is a hook
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
}

export default function NavLink({ href, label }: NavLinkProps) {
  // Returns current URL e.g. "/arena" — updates on every navigation
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      // rk-nav-link is kept for the ::before underline pseudo-element
      // (Tailwind can't target ::before — handled in Header.tsx's <style> block)
      className={`
        rk-nav-link
        relative px-4 py-2
        font-semibold text-[0.95rem] tracking-widest uppercase
        no-underline transition-colors duration-300
        ${isActive
          ? "text-[#c9a84c]"               // gold when on this page
          : "text-white/55 hover:text-[#e8c96e]"  // dim white → gold on hover
        }
      `}
    >
      {label}
    </Link>
  );
}