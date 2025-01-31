import { Card, CardBody } from "@heroui/card";
import { Progress } from "@heroui/progress";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { FileIcon } from "../icons";

import { UploadedFile } from "./EventSourcing";

interface FileProgress {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "ERROR";
  progress: number;
  error?: string;
}

interface FileProgressProps {
  fileId: string;
  file: UploadedFile;
}

const FileProgress: React.FC<FileProgressProps> = ({ fileId, file }) => {
  const [progress, setProgress] = useState<FileProgress>({
    status: "PENDING",
    progress: 0,
  });

  useEffect(() => {
    const eventSource = new EventSource(`/events/${fileId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "FILE_PROCESSING":
          setProgress({
            status: "PROCESSING",
            progress: data.data.progress,
          });
          break;
        case "FILE_PROCESSED":
          setProgress({
            status: "COMPLETED",
            progress: 100,
          });
          eventSource.close();
          break;
        case "FILE_ERROR":
          toast.error(data.data.error);
          setProgress({
            status: "ERROR",
            progress: data.data.progress || 0,
            error: data.data.error,
          });
          eventSource.close();
          break;
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setProgress((prev) => ({
        ...prev,
        status: "ERROR",
        error: "Connection lost",
      }));
    };

    return () => {
      eventSource.close();
    };
  }, [fileId]);

  const getStatusColor = () => {
    switch (progress.status) {
      case "COMPLETED":
        return "success";
      case "ERROR":
        return "danger";
      default:
        return "primary";
    }
  };

  return (
    <Card className="w-[400px]" shadow="none">
      <CardBody className="flex flex-row gap-3 items-center">
        <FileIcon fileType={file?.metadata?.mimeType} size={36} />
        <div className="flex-1">
          {progress.error ? (
            <p className="text-sm font-medium text-danger">
              Error: {progress.error}
            </p>
          ) : (
            <>
              <div>
                {/* <span>{file?.metadata?.originalName}</span> */}
                <Progress
                  color={getStatusColor()}
                  //   label={file?.metadata?.originalName}
                  {...(progress.status === "COMPLETED"
                    ? {
                        label: file?.metadata?.originalName,

                        showValueLabel: true,
                      }
                    : {
                        label:
                          progress.status !== "ERROR"
                            ? file?.metadata?.originalName
                            : progress.error,
                        isIndeterminate: progress.status !== "ERROR",
                      })}
                  aria-label="Loading..."
                  size="sm"
                  value={progress.progress}
                />
              </div>
              {/* <p className="text-sm font-medium">
                {progress.status === "PROCESSING"
                  ? "Processing..."
                  : progress.status?.toLocaleLowerCase()}
              </p> */}
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default FileProgress;
