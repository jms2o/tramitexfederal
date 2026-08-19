import { ProcedureWizard } from "@/components/account/procedure-wizard";
import { getClientWizardData } from "@/lib/db/client-portal";

export default async function StartProcedurePage() { const data = await getClientWizardData(); return <div className="wizard-fullscreen"><ProcedureWizard {...data} /></div>; }
