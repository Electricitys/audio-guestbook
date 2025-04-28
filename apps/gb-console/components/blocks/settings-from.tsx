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
import { useQuery } from "@tanstack/react-query";

const SCHEMA = z.object({
  FILE_SERVER_URL: z.string().min(3, {
    message: "Url must be at least 2 characters.",
  }),
  TARGET_DIRECTORY: z.string().min(3, {
    message: "Directory path must be at least 2 characters.",
  }),
  OUTPUT_VOLUME: z.number(),
});

export const SettingsFormContents = ({
  defaultValues,
}: {
  defaultValues: z.infer<typeof SCHEMA>;
}) => {
  const client = useClient(true);
  const [testing, setTesting] = React.useState<
    null | "fetching" | "ok" | "error"
  >(null);
  const form = useForm<z.infer<typeof SCHEMA>>({
    resolver: zodResolver(SCHEMA),
    defaultValues: {
      FILE_SERVER_URL: defaultValues.FILE_SERVER_URL || "",
      TARGET_DIRECTORY: defaultValues.TARGET_DIRECTORY || "",
      OUTPUT_VOLUME: defaultValues.OUTPUT_VOLUME || 50,
    },
  });

  async function onSubmit(values: z.infer<typeof SCHEMA>) {
    console.log(values);
    await client.system.settings.post({
      FILE_SERVER_URL: values.FILE_SERVER_URL,
      TARGET_DIR: values.TARGET_DIRECTORY,
      OUTPUT_VOLUME: values.OUTPUT_VOLUME,
    });
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
            <FormField
              control={form.control}
              name="OUTPUT_VOLUME"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="form-volume-level" className="mb-2">
                    Volume Level
                  </Label>
                  <Slider
                    id="form-volume-level"
                    defaultValue={[50]}
                    onValueChange={(value) => field.onChange(value[0])}
                    step={1}
                    min={0}
                    max={100}
                    className="w-auto"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <Button type="submit" loading={form.formState.isSubmitting}>
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export const SettingsForm = () => {
  const client = useClient(true);
  const { data, isLoading } = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ["settings-form"],
    queryFn: async () => {
      const res = await client.system.settings.get();
      return {
        FILE_SERVER_URL: res.FILE_SERVER_URL,
        OUTPUT_VOLUME: Number(res.OUTPUT_VOLUME),
        TARGET_DIRECTORY: res.TARGET_DIR,
      };
    },
  });

  if (isLoading) {
    return null;
  }

  return (
    <SettingsFormContents
      defaultValues={{
        FILE_SERVER_URL: data?.FILE_SERVER_URL,
        OUTPUT_VOLUME: data?.OUTPUT_VOLUME as number,
        TARGET_DIRECTORY: data?.TARGET_DIRECTORY,
      }}
    />
  );
};
