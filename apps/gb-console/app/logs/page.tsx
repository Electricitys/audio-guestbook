import { LoggerTable } from "@/components/blocks/logger-table";

export default function LogsPage() {
  return (
    <main className="container mx-auto max-w-4xl p-4">
      <section className="mb-6">
        <h2 className="text-xl font-semibold">Logs</h2>
        <LoggerTable />
      </section>
    </main>
  );
}
