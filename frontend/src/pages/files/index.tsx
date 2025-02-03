import { useEffect } from "react";
import { Button } from "@heroui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import DefaultLayout from "@/layouts/default";
import FilesTable from "@/components/ui/FilesTable";
import { api } from "@/services/api";

export default function FilesPage() {
  const navigate = useNavigate();
  const [getData, { data: files, isLoading, isFetching }] =
    api.useLazyGetFilesQuery();

  useEffect(() => {
    getData({
      limit: 100,
      page: 1,
    });
  }, []);

  return (
    <DefaultLayout>
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-row gap-3 items-center mb-6">
            <Button
              isIconOnly
              radius="full"
              onPress={() => {
                navigate(-1);
              }}
            >
              <ChevronLeft />
            </Button>
            <h1 className="text-4xl font-bold">Uploaded files</h1>
          </div>

          <FilesTable
            data={files?.data?.files || []}
            isLoading={isLoading || isFetching}
          />
        </div>
      </section>
    </DefaultLayout>
  );
}
