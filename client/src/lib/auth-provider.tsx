import { AuthProvider } from "@/hooks/use-auth";
import { ReactNode } from "react";

export function AppAuthProvider({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
