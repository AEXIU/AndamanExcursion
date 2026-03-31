import { ReactNode } from "react";

export interface CustomLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}
