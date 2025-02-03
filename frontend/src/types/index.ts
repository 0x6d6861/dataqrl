import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type FilesResponse = {
  success: boolean;
  data: {
    files: Array<{
      processedData: {
        summary: {
          rowCount: number;
          columns: Record<string, Record<string, any>>;
        };
      };
      _id: string;
      originalName: string;
      mimeType: string;
      size: number;
      status: string;
      createdAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export type SingleFileResponse = {
  success: boolean;
  data: {
    file: {
      processedData: {
        summary: {
          rowCount: number;
          columns: Record<string, Record<string, any>>;
        };
      };
      _id: string;
      originalName: string;
      mimeType: string;
      size: number;
      status: string;
      createdAt: string;
    };
  };
};
