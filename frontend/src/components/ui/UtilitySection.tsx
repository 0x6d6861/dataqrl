import { useCallback, useEffect, useState } from "react";

import FileCard, { FileData } from "./FileCard";
import EventSourcing, { UploadedFile } from "./EventSourcing";
import FileProgress from "./FileProgress";

const fileData = {
  processedData: {
    summary: {
      rowCount: 934,
    },
  },
  _id: "679cd55a448027445f3df0cc",
  originalName: "customers_with_businesses (1).csv",
  mimeType: "text/csv",
  size: 247047,
  status: "COMPLETED",
  createdAt: "2025-01-31T13:51:22.270Z",
};

const getRecentFiles = () => {
  return fetch("/files?limit=5&sort=createdAt&order=desc")
    .then((res) => res.json())
    .then((data) => data.data.files);
};

function UtilitySection() {
  const [data, setData] = useState<UploadedFile[]>([]);
  const [recents, setRecents] = useState<FileData[]>([]);

  const addToData = useCallback((file: UploadedFile) => {
    setData((prevData) => [file, ...prevData]);
  }, []);

  const removeFromData = useCallback((file: UploadedFile) => {
    setData((prevData) =>
      prevData.filter((item: UploadedFile) => item.fileId !== file.fileId),
    );
  }, []);

  useEffect(() => {
    getRecentFiles().then((data: FileData[]) => {
      setRecents(data);
    });
  }, []);

  return (
    <>
      <EventSourcing onUpload={addToData} />
      <div className="flex w-full flex-col space-y-6">
        <div className="min-h-[150px] rounded-lg w-full p-6 bg-gray-50 space-y-3">
          {data.map((file: UploadedFile) => (
            <FileProgress key={file.fileId} file={file} fileId={file.fileId} />
          ))}
        </div>

        <div className="min-h-[350px] rounded-lg w-full space-y-4">
          {recents.map((file: FileData) => (
            <FileCard key={file._id} data={file} />
          ))}
        </div>
      </div>
    </>
  );
}

export default UtilitySection;
