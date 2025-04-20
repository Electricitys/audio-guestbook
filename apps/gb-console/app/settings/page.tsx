import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

export default function SettingsPage() {
  return (
    <main className="container mx-auto max-w-4xl p-4">
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <div className="flex flex-col gap-5">
          <div>
            <Label htmlFor="form-server-url" className="mb-2">
              Server Url
            </Label>
            <Input
              id="form-server-url"
              type="text"
              className="w-auto p-2 border rounded mb-2"
              placeholder="https://example.com"
            />
            <Button variant={"outline"} size={"sm"}>
              Test Connection
            </Button>
          </div>
          <div>
            <Label htmlFor="form-target-dir" className="mb-2">
              Target directory
            </Label>
            <Input
              id="form-target-dir"
              type="text"
              className="w-auto p-2 border rounded mb-2"
              placeholder="directory/to/path"
            />
          </div>
          <div>
            <Label htmlFor="form-volume-level" className="mb-2">
              Volume Level
            </Label>
            <Slider
              id="form-volume-level"
              defaultValue={[50]}
              step={1}
              min={0}
              max={100}
              className="w-auto"
            />
          </div>
          <div>
            <Button type="submit">Save Settings</Button>
          </div>
        </div>
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
