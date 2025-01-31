import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { FileBox, CheckCircle2 } from "lucide-react";
import { Badge } from "@heroui/badge";
import { FileIcon } from "../icons";


{/* <a href="https://www.flaticon.com/free-icons/csv" title="csv icons">Csv icons created by Muhammad Andy - Flaticon</a> */}

export interface FileData {
  processedData: {
    summary: {
      rowCount: number;
    };
  };
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: string;
  createdAt: string;
  processingError?: string;
}

interface FileCardProps {
  data: FileData;
}

function FileCard({ data }: FileCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes > 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Badge
      color={data.status === "COMPLETED" ? "success" : "danger"}
      content={data.status.toLowerCase()}
      isInvisible={data.status === "COMPLETED"}
      size="sm"
    >
      <Card isPressable className="min-w-[400px]" shadow="sm">
        <CardBody className="flex flex-row items-center space-x-3">
                  <FileIcon fileType={data.mimeType} size={48} />
          {/* <Avatar icon={<FileBox className="text-primary" />} size="lg" /> */}
          <div className="flex flex-col flex-1 gap-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">{data.originalName}</p>
              {/* <Badge
              color={data.status === "COMPLETED" ? "success" : "warning"}
              className="capitalize"
            >
              {data.status.toLowerCase()}
            </Badge> */}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {data.status === "COMPLETED" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>
                    {data.processedData.summary.rowCount.toLocaleString()} rows
                    processed
                  </span>
                  <span>-</span>
                </>
              ) : (
                <>
                  <span className="text-danger">{data?.processingError}</span>
                </>
              )}
              <span>{formatFileSize(data.size)}</span>
            </div>
          </div>
        </CardBody>
        {/* <CardFooter className="gap-3 flex flex-row justify-between">
        <p className="text-sm text-gray-500">
          Created: {formatDate(data.createdAt)}
        </p>
        <p className="text-sm text-gray-500">
          {formatFileSize(data.size)}
        </p>
      </CardFooter> */}
      </Card>
    </Badge>
  );
}

export default FileCard;
