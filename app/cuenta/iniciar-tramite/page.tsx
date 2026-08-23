import { ProcedureStartExperience } from "@/components/account/procedure-start-experience";
import { getClientWizardData } from "@/lib/db/client-portal";

export default async function StartProcedurePage() {
  const data = await getClientWizardData();
  return <div className="wizard-fullscreen"><ProcedureStartExperience {...data} /></div>;
}
