'use client';

import { usePathname } from 'next/navigation';
import { NavbarConnected } from './NavbarConnected';
import { Footer } from './Footer';

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <NavbarConnected />
      {children}
      <Footer />
    </>
  );
}
