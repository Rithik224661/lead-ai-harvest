
import { Layout } from "@/components/Layout";

const Leads = () => {
  const params = new URLSearchParams(window.location.search);
  const priority = params.get('priority');
  
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">My Leads</h1>
        {priority && (
          <div className="mb-4 p-3 bg-muted rounded-md">
            <p>Showing leads with {priority} priority</p>
          </div>
        )}
        <p className="text-muted-foreground">
          This page will show all your saved leads with filtering options.
        </p>
      </div>
    </Layout>
  );
};

export default Leads;
