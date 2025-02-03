import { Chip } from "@heroui/chip";
import { FileBox, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { TableCell, TableRow } from "@heroui/table";
import { Link } from "react-router-dom";

import { FileIcon } from "../icons";

{
  /* <a href="https://www.flaticon.com/free-icons/csv" title="csv icons">Csv icons created by Muhammad Andy - Flaticon</a> */
}

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

interface FileRowProps {
  data: FileData;
}

function FileRow({ data }: FileRowProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes > 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "ERROR":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <TableRow className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
      <TableCell key={'1'} className="py-4">
        <div className="flex items-center space-x-3">
          <FileIcon fileType={data.mimeType} size={32} />
          <Link
            className="text-sm font-medium text-gray-900"
            to={`/uploads/${data._id}`}
          >
            {data.originalName}
          </Link>
        </div>
      </TableCell>
      <TableCell key={'2'} className="py-4">
        <div className="flex items-center space-x-2">
          <Chip
            className="capitalize px-2 py-1 text-xs"
            color={data.status === "COMPLETED" ? "success" : "danger"}
          >
            {data.status.toLowerCase()}
          </Chip>
          {getStatusIcon()}
        </div>
      </TableCell>
      <TableCell key={'3'} className="py-4">
        {data.status === "COMPLETED" ? (
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <FileBox className="h-4 w-4" />
              <span>
                {data.processedData.summary.rowCount.toLocaleString()} rows
              </span>
            </div>
          </div>
        ) : (
          data.processingError && (
            <p className="text-red-600 bg-red-50 px-3 py-1 rounded-md text-sm">
              {data.processingError}
            </p>
          )
        )}
      </TableCell>
      <TableCell key={'4'} className="py-4 text-sm text-gray-600">
        {formatFileSize(data.size)}
      </TableCell>
      <TableCell key={'5'} className="py-4 text-sm text-gray-600">
        {new Date(data.createdAt).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
}

export default FileRow;
