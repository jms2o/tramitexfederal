import type { ReactNode } from "react";
import { AccountFrame } from "@/components/account/account-frame";
import { requireClient } from "@/lib/auth/session";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const { session } = await requireClient();
  return <AccountFrame email={session.user.email ?? ""}>{children}</AccountFrame>;
}
