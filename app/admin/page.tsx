import { DashboardView } from "@/components/admin/dashboard-view";
import { getDashboardData } from "@/lib/db/dashboard";

export const metadata = { title: "Administración", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const data = await getDashboardData();
  return <DashboardView data={data} />;
}
