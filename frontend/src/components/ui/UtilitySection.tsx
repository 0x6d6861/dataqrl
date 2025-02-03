// import { useCallback, useState } from "react";
import { Link } from "@heroui/link";
import { Card, CardBody } from "@heroui/card";

// import EventSourcing, { UploadedFile } from "./EventSourcing";
import FilesTable from "./FilesTable";

import { api } from "@/services/api";

function UtilitySection() {
  const { data: recents, isLoading, isFetching } = api.useGetRecentFilesQuery();
  // const [data, setData] = useState<UploadedFile[]>([]);

  // const addToData = useCallback((file: UploadedFile) => {
  //   setData((prevData) => [file, ...prevData]);
  // }, []);

  const reventFiles = recents?.data?.files || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* <EventSourcing onUpload={addToData} /> */}

      <div className="flex w-full flex-col space-y-8">
        <Card>
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Recent Files</h3>
            <Link
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              href="/uploads"
            >
              View all files →
            </Link>
          </div>
          <CardBody>
            <FilesTable
              data={reventFiles}
              isLoading={isLoading || isFetching}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default UtilitySection;
