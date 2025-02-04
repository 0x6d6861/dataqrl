import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { FilesResponse, SingleFileResponse } from "@/types";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getFiles: builder.query<
      FilesResponse,
      {
        page: number;
        limit: number;
      }
    >({
      query: ({ page, limit }) => `/upload/files?limit=${limit}&page=${page}`,
    }),
    getRecentFiles: builder.query<FilesResponse, void>({
      query: () => `/upload/files?limit=5&page=1`,
    }),
    getFileById: builder.query<SingleFileResponse, string>({
      query: (id) => `/upload/files/${id}`,
    }),
    getFileData: builder.query<
      SingleFileResponse,
      {
        fileId: string;
        query?: Record<string, any>;
        sort?: Record<string, number>;
        page: number;
        limit: number;
      }
    >({
      query: ({ fileId, query, sort, page, limit }) => ({
        url: `/upload/files/${fileId}/data`,
        method: "GET",
        params: {
          query: query ? JSON.stringify(query) : undefined,
          sort: sort ? JSON.stringify(sort) : undefined,
          page,
          limit,
        },
      }),
    }),
    uploadFile: builder.mutation<{ fileId: string }, FormData>({
      query: (formData) => ({
        url: "/upload/upload",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetFilesQuery,
  useGetRecentFilesQuery,
  useGetFileByIdQuery,
  useUploadFileMutation,
} = api;
