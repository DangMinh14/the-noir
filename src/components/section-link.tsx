"use client";

import { useEffect, type MouseEvent, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

const PENDING_SCROLL_KEY = "noir:scrollTo";

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
}

// Landing-page sections (story, ritual, maisons...) only exist on "/", so a
// link to one from another route has to navigate home first. We never touch
// the URL hash for this: the target id is stashed in sessionStorage and
// PendingScrollConsumer (mounted once on the home page) picks it up and
// scrolls after the route change, so the address bar just reads "/".
export function SectionLink({
  id,
  className,
  onNavigate,
  children,
}: {
  id: string;
  className?: string;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // Let modifier-clicks (open in new tab, etc.) fall through to the
    // plain "/#id" href instead of hijacking them.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate?.();
    if (pathname === "/") {
      scrollToSection(id);
    } else {
      sessionStorage.setItem(PENDING_SCROLL_KEY, id);
      router.push("/");
    }
  }

  return (
    <a href={`/#${id}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

// Mounted once on the home page to finish a cross-page SectionLink navigation.
export function PendingScrollConsumer() {
  useEffect(() => {
    const id = sessionStorage.getItem(PENDING_SCROLL_KEY);
    if (!id) return;
    sessionStorage.removeItem(PENDING_SCROLL_KEY);
    requestAnimationFrame(() => scrollToSection(id));
  }, []);

  return null;
}
