import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface FileProgress {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "ERROR";
  progress: number;
  error?: string;
}

export interface UploadedFile {
  fileId: string;
  path: string;
  metadata: {
    originalName: string;
    mimeType: string;
    size: number;
  };
}

const FileProgress: React.FC<{
  onUpload: (file: UploadedFile) => void;
}> = ({ onUpload }) => {
  const [state, setState] = useState<string>("");
  const [file, setFile] = useState<UploadedFile>({
    fileId: "",
    path: "",
    metadata: {
      originalName: "",
      mimeType: "",
      size: 0,
    },
  });

  useEffect(() => {
    const eventSource = new EventSource(`/api/events/events`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const file = data.data as UploadedFile;

      if (!file) {
        setFile(file);
      }
      setState(data.type as string);

      switch (data.type) {
        case "FILE_UPLOADED":
          onUpload(file);
          break;
        case "FILE_PROCESSING":
          break;
        case "FILE_PROCESSING_ERROR":
          break;
        case "FILE_PROCESSED":
          break;
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (file && state) {
      switch (state) {
        case "FILE_UPLOADED":
          toast.info(
            `File ${file?.metadata?.originalName} ready for processing`,
          );
          break;
        case "FILE_PROCESSING":
          break;
        case "FILE_PROCESSING_ERROR":
          toast.error(`File ${file?.metadata?.originalName} processing failed`);
          break;
        case "FILE_PROCESSED":
          toast.success(
            `File ${file?.metadata?.originalName} processed successfully`,
          );
          break;
      }
    }
  }, [state, file]);

  return <></>;
};

export default FileProgress;
