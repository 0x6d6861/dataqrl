import { Card, CardBody, CardFooter } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";

import { FileIcon } from "../icons";

interface FileHandlerProps {
  file: File;
  onUploadComplete?: (fileId: string) => void;
}

type FileStatus = "UPLOADING" | "PROCESSING" | "COMPLETED" | "ERROR";

interface FileProgress {
  status: FileStatus;
  progress: number;
  error?: string;
  fileId?: string;
}

function FileHandler({ file, onUploadComplete }: FileHandlerProps) {
  const [progress, setProgress] = useState<FileProgress>({
    status: "UPLOADING",
    progress: 0,
  });

  // Handle file upload
  useEffect(() => {
    const uploadFile = async () => {
      const formData = new FormData();

      formData.append("file", file);

      try {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", "/api/upload/upload");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress((prev) => ({
              ...prev,
              progress: Math.round((event.loaded / event.total) * 100),
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);

              const fileId = response.data.fileId; // Assuming the server returns a fileId

              setProgress((prev) => ({
                ...prev,
                status: "PROCESSING",
                progress: 0,
                fileId,
              }));
              onUploadComplete?.(fileId);
              initializeProcessingProgress(fileId);
            } catch (error) {
              handleError("Invalid server response");
            }
          } else {
            handleError(
              xhr.responseText || `Upload failed with status ${xhr.status}`,
            );
          }
        };

        xhr.onerror = () => {
          handleError("Upload failed. Please try again.");
        };

        xhr.send(formData);
      } catch (err) {
        handleError(
          err instanceof Error
            ? err.message
            : "Upload failed. Please try again.",
        );
      }
    };

    uploadFile();
  }, [file]);

  // Handle file processing
  const initializeProcessingProgress = (fileId: string) => {
    const eventSource = new EventSource(`/api/events/events/${fileId}`);
  
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
  
      switch (data.type) {
        case "FILE_PROCESSING":
          setProgress((prev) => ({
            ...prev,
            status: "PROCESSING",
            progress: data.data.progress || prev.progress,
          }));
          break;
        case "FILE_PROCESSED":
          setProgress((prev) => ({
            ...prev,
            status: "COMPLETED",
            progress: 100,
          }));
          eventSource.close();
          break;
        case "FILE_ERROR":
          handleError(data.data.error);
          eventSource.close();
          break;
        default:
          // Handle unknown event types
          console.warn("Unknown event type:", data.type);
      }
    };
  
    eventSource.onerror = () => {
      eventSource.close();
      handleError("Processing connection lost");
    };
  
    // Cleanup function
    return () => {
      eventSource.close();
    };
  };

  const handleError = (errorMessage: string) => {
    setProgress((prev) => ({
      ...prev,
      status: "ERROR",
      error: errorMessage,
    }));
    toast.error(file.name, {
      description: errorMessage,
    });
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case "COMPLETED":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "ERROR":
        return <XCircle className="w-6 h-6 text-red-500" />;
      case "PROCESSING":
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      default:
        return <FileText className="w-6 h-6 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case "UPLOADING":
        return "Uploading...";
      case "PROCESSING":
        return "Processing...";
      case "COMPLETED":
        return "Completed";
      case "ERROR":
        return "Failed";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto hover:shadow-md transition-all duration-200">
      <CardBody className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <FileIcon fileType={file.type} size={40} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </h3>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
              </div>
            </div>

            {progress.error ? (
              <div className="bg-red-50 border border-red-100 rounded-md p-3">
                <p className="text-sm text-red-600">{progress.error}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Progress
                  classNames={{
                    base: "max-w-full",
                    track: "bg-gray-100",
                    indicator:
                      progress.status === "COMPLETED"
                        ? "bg-green-500"
                        : progress.status === "ERROR"
                          ? "bg-red-500"
                          : "bg-blue-500",
                    label: "text-xs font-medium text-gray-600",
                    value: "text-xs font-medium text-gray-600",
                  }}
                  color={
                    progress.status === "COMPLETED" ? "success" : "primary"
                  }
                  size="sm"
                  value={progress.progress}
                  {...(progress.status === "PROCESSING"
                    ? {
                        isIndeterminate: true,
                        // showValueLabel: false,
                      }
                    : {
                        // showValueLabel: true,
                        isIndeterminate: false,
                      })}
                />
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{getStatusText()}</span>
                  <span>{progress.progress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardBody>

      <CardFooter className="px-4 py-3 bg-gray-50">
        <div className="w-full flex justify-between items-center text-xs text-gray-500">
          <span>
            Last modified: {new Date(file.lastModified).toLocaleString()}
          </span>
          <span className="font-medium">
            {file.size > 1024 * 1024
              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
              : `${(file.size / 1024).toFixed(2)} KB`}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

export default FileHandler;
