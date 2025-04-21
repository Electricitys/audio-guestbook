"use client";

import { SystemHealthResponse, useClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import byteSize from "byte-size";
import { cx } from "class-variance-authority";
import React from "react";
import moment from "moment";
import { Skeleton } from "../ui/skeleton";

export const DeviceStatus = () => {
  const client = useClient();

  const { data, isLoading } = useQuery<SystemHealthResponse>({
    queryKey: ["system-health"],
    queryFn: async () => {
      return await client.system.health();
    },
  });

  const isOnline = data?.status === "ok";
  const memoryRss = React.useMemo(
    () => byteSize(data?.memory_usage.rss || 0).toString(),
    [data?.memory_usage.rss]
  );

  const lastSync = React.useMemo(
    () =>
      data?.last_sync != null ? moment(data?.last_sync).fromNow() : "Not yet",
    [data?.last_sync]
  );

  return (
    <div className="p-4 rounded-lg border border-current">
      <div className="flex mb-1">
        <div className="mr-2">Status:</div>
        <div
          className={cx(
            "font-bold",
            isOnline ? "text-green-600" : "text-red-600"
          )}
        >
          {isOnline ? "Online" : "Offline"}
        </div>
      </div>
      <div className="flex mb-1">
        <div className="mr-2">Memory:</div>
        {isLoading ? (
          <Skeleton className="w-[120px]" />
        ) : (
          <div className="font-bold">{memoryRss}</div>
        )}
      </div>
      <div className="flex mb-1">
        <div className="mr-2">Last Sync:</div>
        {isLoading ? (
          <Skeleton className="w-[120px]" />
        ) : (
          <div className="font-bold">{lastSync}</div>
        )}
      </div>
    </div>
  );
};
