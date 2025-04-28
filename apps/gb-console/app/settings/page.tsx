import { SettingsForm } from "@/components/blocks/settings-from";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <main className="container mx-auto max-w-4xl p-4">
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <SettingsForm />
      </section>

      <Separator className="my-4" />

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Device Settings</h2>
        <div className="flex gap-5">
          <Button variant={"outline"} size="sm">
            Restart Device
          </Button>
          <Button variant={"destructive"} size="sm">
            Factory Reset
          </Button>
        </div>
      </section>

      <Separator className="my-4" />

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Help</h2>
        <Button variant={"outline"}>Open Help Documentation</Button>
      </section>
    </main>
  );
}
