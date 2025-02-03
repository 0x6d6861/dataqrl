import { Card, CardBody } from "@heroui/card";
import { Progress } from "@heroui/progress";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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

  const getStatusIcon = () => {
    switch (progress.status) {
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "ERROR":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "PROCESSING":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-xl hover:shadow-md transition-all duration-200">
      <CardBody className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <FileIcon fileType={file?.metadata?.mimeType} size={40} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {file?.metadata?.originalName}
              </h3>
              <div className="flex-shrink-0 ml-2">
                {getStatusIcon()}
              </div>
            </div>

            {progress.error ? (
              <div className="bg-red-50 border border-red-100 rounded-md p-3">
                <p className="text-sm text-red-600">
                  {progress.error}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Progress
                  color={getStatusColor()}
                  aria-label="Processing..."
                  size="sm"
                  value={progress.progress}
                  classNames={{
                    base: "max-w-full",
                    track: "bg-gray-100",
                    indicator: progress.status === "COMPLETED" 
                      ? "bg-green-500" 
                      : progress.status === "ERROR"
                      ? "bg-red-500"
                      : "bg-blue-500",
                    label: "text-xs font-medium text-gray-600",
                    value: "text-xs font-medium text-gray-600"
                  }}
                  {...(progress.status === "PROCESSING" && { 
                    isIndeterminate: true 
                  })}
                />
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    {progress.status === "PROCESSING" 
                      ? "Processing..." 
                      : progress.status === "COMPLETED"
                      ? "Completed"
                      : progress.status === "ERROR"
                      ? "Failed"
                      : "Pending"}
                  </span>
                  <span>{progress.progress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default FileProgress;
