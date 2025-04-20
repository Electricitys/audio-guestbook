import { FilesStatusTable } from "@/components/blocks/files-status-table";

export default function StatusPage() {
  return (
    <main className="container mx-auto max-w-4xl p-4">
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Device Status</h2>
        <div className="bg-muted p-4 rounded-lg">
          <p>
            Status: <span className="font-bold text-green-600">Online</span>
          </p>
          <p>
            Battery: <span className="font-bold">85%</span>
          </p>
          <p>
            Last Sync: <span className="font-bold">5 minutes ago</span>
          </p>
        </div>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold">File Status</h2>
        <FilesStatusTable />
      </section>
    </main>
  );
}
