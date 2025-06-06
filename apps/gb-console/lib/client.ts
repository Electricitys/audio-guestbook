"use client";

import React from "react";
import CONSTANTS from "./constants";

export const createClient = (baseUrl: string) => {
  return {
    system: {
      health: systemHealth(baseUrl),
      logs: systemLogs(baseUrl),
      test_connection: testServerConnection(baseUrl),
      settings: {
        get: getSettings(baseUrl),
        post: postSettings(baseUrl),
      },
    },
    file_collection: {
      list: getFiles(baseUrl),
      sync: syncFiles(baseUrl),
    },
  };
};

export type SystemHealthResponse = {
  status: string;
  message: string;
  uptime: number;
  uid: number;
  memory_usage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  last_sync: string | null;
};

export type FileItemStatus =
  | "recording"
  | "saved"
  | "pending"
  | "uploading"
  | "success"
  | "error"
  | "failed";

export type FileItem = {
  id: number;
  name: string;
  size: number;
  path: string;
  time: Date;
  status: FileItemStatus;
};

export type SystemLog = {
  id: number;
  time: string;
  message: string;
  type: string;
};

export type SystemLogsResponse = SystemLog[];

export type FilesResponse = FileItem[];

const systemHealth =
  (baseUrl: string) => async (): Promise<SystemHealthResponse> => {
    const response = await fetch(`${baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  };

const systemLogs =
  (baseUrl: string) => async (): Promise<SystemLogsResponse> => {
    const response = await fetch(`${baseUrl}/api/logs`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  };

const getFiles = (baseUrl: string) => async (): Promise<FilesResponse> => {
  const response = await fetch(`${baseUrl}/api/files`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

const syncFiles = (baseUrl: string) => async () => {
  const response = await fetch(`${baseUrl}/api/sync`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

const postSettings =
  (baseUrl: string) =>
  async (payload: {
    FILE_SERVER_URL: string;
    TARGET_DIR: string;
    OUTPUT_VOLUME: number;
  }) => {
    const response = await fetch(`${baseUrl}/api/settings`, {
      method: "post",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  };
const getSettings = (baseUrl: string) => async () => {
  const response = await fetch(`${baseUrl}/api/settings`, {
    method: "get",
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

const testServerConnection = (baseUrl: string) => async (url: string) => {
  const response = await fetch(
    `${baseUrl}/api/server_connection_test?url=${url}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

export const useClient = (isAbsoluteURL: boolean = false) => {
  const clientInstance = React.useMemo(() => {
    const SERVER_URL = new URL(CONSTANTS.SERVER_URL);
    if (typeof window !== "undefined" && isAbsoluteURL)
      SERVER_URL.hostname = window.location.hostname;
    return createClient(SERVER_URL.origin);
  }, [isAbsoluteURL]);
  return clientInstance;
};
