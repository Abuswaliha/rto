import { PortalHeader, PrototypeFooter } from "./portal-header";
import { MobileBottomNav } from "./mobile-bottom-nav";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PortalHeader />
      <main className="portal-main min-h-[calc(100vh-320px)] pb-20 md:pb-0">{children}</main>
      <MobileBottomNav />
      <PrototypeFooter />
    </>
  );
}
