
import { Layout } from "@/components/Layout";
import { SettingsContent } from "@/components/SettingsContent";
import { AuditLogViewer } from "@/components/AuditLogViewer";

const Settings = () => {
  return (
    <Layout>
      <div className="p-6 space-y-8">
        <SettingsContent />
        <AuditLogViewer />
      </div>
    </Layout>
  );
};

export default Settings;
