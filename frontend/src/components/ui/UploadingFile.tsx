import { Card, CardBody, CardFooter } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileText, CheckCircleIcon, XCircleIcon } from "lucide-react";

const uploadUrl = "/upload";

interface UploadingFileProps {
  file: File;
  onUploadComplete?: (success: boolean) => void;
  //   uploadUrl: string;
}

function UploadingFile({ file, onUploadComplete }: UploadingFileProps) {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(true);

  useEffect(() => {
    const uploadFile = async () => {
      const formData = new FormData();

      formData.append("file", file);

      try {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", uploadUrl);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;

            setProgress(Math.round(percentComplete));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            setIsUploading(false);
            onUploadComplete?.(true);
          } else {
            try {
              const response = JSON.parse(xhr.responseText);
              setError(response.error || `Upload failed with status ${xhr.status}`);
            } catch {
              setError(`Upload failed with status ${xhr.status}`);
            }
            setIsUploading(false);
            onUploadComplete?.(false);
          }
        };

        xhr.onerror = () => {
          try {
            const response = JSON.parse(xhr.responseText);
            setError(response.message || "Upload failed. Please try again.");
          } catch {
            setError("Upload failed. Please try again.");
          }
          setIsUploading(false);
          onUploadComplete?.(false);
        };

        xhr.send(formData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed. Please try again.";
        setError(errorMessage);
        setIsUploading(false);
        onUploadComplete?.(false);
      }
    };

    uploadFile();
  }, [file, onUploadComplete]);

  useEffect(() => {
    if (error) {
      toast.error(file.name, {
        description: error,
      });
    }
  }, [error]);

  return (
    <Card className="w-full max-w-2xl mx-auto hover:shadow-md transition-shadow duration-200">
      <CardBody className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {error ? (
              <XCircleIcon className="w-8 h-8 text-red-500" />
            ) : isUploading ? (
                <FileText className="w-8 h-8 text-blue-500 animate-pulse" />
            ) : (
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
              {file.name}
            </h3>
            {error ? (
              <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
                {error}
              </p>
            ) : (
              <Progress
                className="max-w-full"
                color={isUploading ? "primary" : "success"}
                maxValue={100}
                showValueLabel={true}
                size="sm"
                value={progress}
                classNames={{
                  base: "max-w-full",
                  track: "bg-gray-100",
                  indicator: isUploading 
                    ? "bg-blue-500" 
                    : "bg-green-500",
                  label: "text-xs font-medium text-gray-600",
                  value: "text-xs font-medium text-gray-600"
                }}
              />
            )}
          </div>
        </div>
      </CardBody>

      <CardFooter className="px-4 py-3 bg-gray-50">
        <div className="w-full flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="inline-block">
              Last modified: {new Date(file.lastModified).toLocaleString()}
            </span>
          </div>
          <div className="font-medium">
            {file.size > 1024 * 1024
              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
              : `${(file.size / 1024).toFixed(2)} KB`}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default UploadingFile;
