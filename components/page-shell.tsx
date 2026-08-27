import { PortalHeader, PrototypeFooter } from "./portal-header";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PortalHeader />
      <main className="portal-main min-h-[calc(100vh-320px)]">{children}</main>
      <PrototypeFooter />
    </>
  );
}
