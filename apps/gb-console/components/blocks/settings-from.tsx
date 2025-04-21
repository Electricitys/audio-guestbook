"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useClient } from "@/lib/client";
import React from "react";
import { CheckIcon } from "lucide-react";

const SCHEMA = z.object({
  FILE_SERVER_URL: z.string().min(3, {
    message: "Url must be at least 2 characters.",
  }),
  TARGET_DIRECTORY: z.string().min(3, {
    message: "Directory path must be at least 2 characters.",
  }),
  OUTPUT_VOLUME: z.number(),
});

export const SettingsForm = () => {
  const client = useClient();
  const [testing, setTesting] = React.useState<
    null | "fetching" | "ok" | "error"
  >(null);
  const form = useForm<z.infer<typeof SCHEMA>>({
    resolver: zodResolver(SCHEMA),
    defaultValues: {
      FILE_SERVER_URL: "",
      TARGET_DIRECTORY: "",
      OUTPUT_VOLUME: 50,
    },
  });

  function onSubmit(values: z.infer<typeof SCHEMA>) {
    console.log(values);
  }

  async function handleConnection(value: string) {
    try {
      await setTesting("fetching");
      await client.system.test_connection(value);
      await setTesting("ok");
      form.clearErrors("FILE_SERVER_URL");
    } catch (err) {
      const error = err as Error;
      await setTesting("error");
      form.setError("FILE_SERVER_URL", {
        message: error.message,
        type: "required",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="max-w-sm flex flex-col gap-5">
          <div>
            <FormField
              control={form.control}
              name="FILE_SERVER_URL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Url</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="w-auto"
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <Button
                    type="button"
                    variant={"outline"}
                    size={"sm"}
                    className={testing === "ok" ? "border-green-600" : ""}
                    onClick={() => handleConnection(field.value)}
                    loading={testing === "fetching"}
                    disabled={testing === "fetching"}
                  >
                    Test Connection
                    {testing === "ok" && <CheckIcon />}
                  </Button>
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="TARGET_DIRECTORY"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target directory</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="w-auto"
                      placeholder="directory/to/path"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
      </form>
    </Form>
  );
};
