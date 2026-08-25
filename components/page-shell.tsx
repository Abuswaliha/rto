import { PortalHeader, PrototypeFooter } from "./portal-header";
export function PageShell({children}:{children:React.ReactNode}){return <><PortalHeader/><main className="portal-main">{children}</main><PrototypeFooter/></>}
