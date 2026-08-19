"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() { return <button className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-navy" onClick={() => signOut({ callbackUrl: "/" })}><LogOut size={16} />Salir</button>; }
