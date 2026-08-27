import NextLink from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type SafeLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export default function SafeLink({ href, children, ...props }: SafeLinkProps) {
  const isExternal = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href);

  if (isExternal) {
    return <a href={href} {...props}>{children}</a>;
  }

  return <NextLink href={href} {...props}>{children}</NextLink>;
}
