import { DeviceStatus } from "@/components/blocks/device-status";
import { FilesStatusTable } from "@/components/blocks/files-status-table";

export default function StatusPage() {
  return (
    <main className="container mx-auto max-w-4xl p-4">
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Device Status</h2>
        <DeviceStatus />
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold">File Status</h2>
        <FilesStatusTable />
      </section>
    </main>
  );
}
