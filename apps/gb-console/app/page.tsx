import { FilesStatusTable } from "@/components/blocks/files-status-table";
import { Navbar } from "@/components/blocks/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      <Tabs defaultValue="status">
        <main className="container mx-auto max-w-4xl p-4">
          <section className="mb-6">
            <TabsList className="w-full">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </section>

          <TabsContent value="status">
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Device Status</h2>
              <div className="bg-muted p-4 rounded-lg">
                <p>
                  Status:{" "}
                  <span className="font-bold text-green-600">Online</span>
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
          </TabsContent>

          <TabsContent value="logs">
            <section className="mb-6">
              <h2 className="text-xl font-semibold  mb-4">Logs</h2>
              <Textarea
                className="whitespace-pre-line min-h-[50vh]"
                readOnly
                value="Log 1: Device started successfully.&#13;&#10;Log 2: Connection established.&#13;&#10;Log 3: User interaction recorded."
              />
            </section>
          </TabsContent>

          <TabsContent value="settings">
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
              <h2 className="text-xl font-semibold mb-4">Help</h2>
              <Button variant={"outline"}>Open Help Documentation</Button>
            </section>
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
