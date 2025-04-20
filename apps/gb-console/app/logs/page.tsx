import { Textarea } from "@/components/ui/textarea";

export default function LogsPage() {
  return (
    <main className="container mx-auto max-w-4xl p-4">
      <section className="mb-6">
        <h2 className="text-xl font-semibold  mb-4">Logs</h2>
        <Textarea
          className="whitespace-pre-line min-h-[50vh]"
          readOnly
          value="Log 1: Device started successfully.&#13;&#10;Log 2: Connection established.&#13;&#10;Log 3: User interaction recorded."
        />
      </section>
    </main>
  );
}
