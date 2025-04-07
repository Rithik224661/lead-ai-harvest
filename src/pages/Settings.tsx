
import { Layout } from "@/components/Layout";
import { SettingsContent } from "@/components/SettingsContent";
import { AuditLogViewer } from "@/components/AuditLogViewer";
import { TooltipProvider } from "@/components/ui/tooltip";

const Settings = () => {
  return (
    <Layout>
      <TooltipProvider>
        <div className="p-6 space-y-8">
          <SettingsContent />
          <AuditLogViewer />
        </div>
      </TooltipProvider>
    </Layout>
  );
};

export default Settings;
