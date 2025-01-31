import { Card, CardBody, CardFooter } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
    <Card className="min-w-[400px]" shadow="sm">
      <CardBody className="flex flex-row items-center space-x-3">
        {/* <Avatar
          icon={error ? <AlertCircle className="text-red-500" /> : <FileBox />}
          size="lg"
        /> */}
        <div className="flex flex-col flex-1 gap-1">
          {/* <p className="text-sm">{file.name}</p> */}
          {error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : (
            <Progress
              className="max-w-md"
              color={isUploading ? "primary" : "success"}
              label={file.name}
              maxValue={100}
              showValueLabel={true}
              size="sm"
              value={progress}
            />
          )}
        </div>
      </CardBody>
      {/* <Divider /> */}
      <CardFooter className="gap-3 flex flex-row justify-between">
        <p className="text-sm text-gray-500">
          Last modified: {new Date(file.lastModified).toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">
          {file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
            : `${(file.size / 1024).toFixed(2)} KB`}
        </p>
      </CardFooter>
    </Card>
  );
}

export default UploadingFile;
