import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { AlertCircle, CheckCircle2, Clock, FileBox } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { FileIcon } from "../icons";

import { FileData } from "./FileCard";

function FilesTable(props: { data: FileData[]; isLoading: boolean }) {
  const navigate = useNavigate();

  const formatFileSize = (bytes: number) => {
    if (bytes > 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const getStatusIcon = (data: FileData) => {
    switch (data.status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "ERROR":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Table
      hideHeader
      removeWrapper
      aria-label="Files table"
      classNames={{
        base: "max-w-full",
        table: "min-w-full",
      }}
    >
      <TableHeader>
        <TableColumn key="name">FILE NAME</TableColumn>
        <TableColumn key="status">STATUS</TableColumn>
        <TableColumn key="info">INFORMATION</TableColumn>
        <TableColumn key="size">SIZE</TableColumn>
        <TableColumn key="date">UPLOAD DATE</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent={"No files uploaded yet"}
        isLoading={props.isLoading}
      >
        {props.data.map((data: FileData) => (
          <TableRow
            key={`row_${data._id}`}
            className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            onClick={() => {
              navigate(`/uploads/${data._id}`);
            }}
          >
            <TableCell className="py-4">
              <div className="flex items-center space-x-3">
                <FileIcon fileType={data.mimeType} size={32} />
                <Link
                  className="text-sm font-medium text-gray-900"
                  href={`/uploads/${data._id}`}
                >
                  {data.originalName}
                </Link>
              </div>
            </TableCell>
            <TableCell key={"2"} className="py-4">
              <div className="flex items-center space-x-2">
                <Chip
                  className="capitalize"
                  color={data.status === "COMPLETED" ? "success" : "danger"}
                  size="sm"
                  variant="flat"
                >
                  <div className="flex flex-row items-center gap-2">
                    <span>{data.status.toLowerCase()}</span>
                    {getStatusIcon(data)}
                  </div>
                </Chip>
              </div>
            </TableCell>
            <TableCell key={"3"} className="py-4">
              {data.status === "COMPLETED" ? (
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <FileBox className="h-4 w-4" />
                    <span>
                      {data.processedData.summary.rowCount.toLocaleString()}{" "}
                      rows
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
            <TableCell key={"4"} className="py-4 text-sm text-gray-600">
              {formatFileSize(data.size)}
            </TableCell>
            <TableCell key={"5"} className="py-4 text-sm text-gray-600">
              {new Date(data.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default FilesTable;
