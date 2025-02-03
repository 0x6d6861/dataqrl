import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@heroui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
} from "@heroui/table";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Pagination } from "@heroui/pagination";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { ChevronLeft } from "lucide-react";

import { api, useGetFileByIdQuery } from "@/services/api";
import DefaultLayout from "@/layouts/default";

export default function FileDetailsPage() {
  const navigate = useNavigate();

  const { id } = useParams();
  const { data: fileData, isLoading } = useGetFileByIdQuery(id!);
  const [
    getFileData,
    { data: fileRawData, isLoading: dataIsLoading, isFetching: dataIsFetching },
  ] = api.useLazyGetFileDataQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColumn, setSelectedColumn] = useState<string>("all");
  const [order, setOrder] = useState<Record<string, 1 | -1>>({});
  const [columns, setColumns] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  useEffect(() => {
    handleSearch();
  }, [page, id, order]);

  // @ts-ignore
  const pages = Math.ceil(fileRawData?.data?.file?.total / limit);

  useEffect(() => {
    if (fileData?.data) {
      setColumns(
        Object.keys(fileData.data?.file?.processedData?.summary?.columns),
      );
    }
  }, [fileData]);

  useEffect(() => {
    handleSearch();
  }, [page, id, order]);

  const handleSort = (column: string) => {
    setOrder((prev) => ({
      [column]: prev[column] === 1 ? -1 : 1,
    }));
  };

  const handleSearch = () => {
    const query: Record<string, any> = {};

    if (searchQuery && selectedColumn !== "all") {
      query[selectedColumn] = searchQuery;
    }

    getFileData({
      fileId: id!,
      limit,
      page,
      query,
      // @ts-ignore
      order,
    });
  };

  const file = fileData?.data?.file;
  const columnsSummary = file?.processedData?.summary?.columns || {};

  if (isLoading || !fileData) {
    return (
      <DefaultLayout>
        <div className="text-center py-8">Loading...</div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
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
              <h1 className="text-4xl font-bold">{file?.originalName}</h1>
            </div>
            <Accordion
              className="space-y-2"
              defaultExpandedKeys={["1"]}
              variant="splitted"
            >
              <AccordionItem key="1" title="File Statistics">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-default-50 rounded-lg">
                    <h3 className="font-medium mb-2">File Details</h3>
                    {/* @ts-ignore */}
                    <p>Size: {(file?.size / 1024).toFixed(2)} KB</p>
                    <p>Type: {file?.mimeType}</p>
                    {/* @ts-ignore */}
                    <p>Uploaded: {new Date(file?.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-default-50 rounded-lg">
                    <h3 className="font-medium mb-2">Data Summary</h3>
                    <p>Total Rows: {file?.processedData?.summary?.rowCount}</p>
                    <p>Total Columns: {columns.length}</p>
                  </div>
                </div>
              </AccordionItem>
              <AccordionItem key="2" title="Colums Statistics">
                <div className="grid grid-cols-5 gap-4 mb-6">
                  {columns.map((column) => (
                    <div key={column} className="p-4 bg-default-50 rounded-lg">
                      <h4 className="font-medium mb-2">{column}</h4>
                      <p>Type: {columnsSummary[column]?.type || "Unknown"}</p>
                      {columnsSummary[column] && (
                        <>
                          <p>
                            Unique Values: {columnsSummary[column].uniqueCount}
                          </p>
                          <p>Null Values: {columnsSummary[column].nullCount}</p>
                          <p>Min Value: {columnsSummary[column].nullCount}</p>
                          <p>Max Value: {columnsSummary[column].maxLength}</p>
                          <p>Empty Values: {columnsSummary[column].empty}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionItem>
            </Accordion>
          </div>

          <Divider />

          <div className="my-4 flex gap-4 items-center">
            <Input
              className="max-w-md"
              placeholder="Search in data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="px-4 py-2 rounded-lg border border-default-200 bg-default-100"
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
            >
              <option value="all">All Columns</option>
              {columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
            <button
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          <div className="">
            <Table
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="secondary"
                    page={page}
                    total={pages}
                    onChange={(page) => setPage(page)}
                  />
                </div>
              }
            >
              <TableHeader>
                {columns.map((column) => (
                  <TableColumn
                    key={column}
                    className="cursor-pointer hover:bg-default-100"
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-2">
                      {column}
                      {order[column] === 1 && "↑"}
                      {order[column] === -1 && "↓"}
                    </div>
                  </TableColumn>
                ))}
              </TableHeader>
              <TableBody
                emptyContent={"No data"}
                isLoading={dataIsLoading || dataIsFetching}
              >
                {/* @ts-ignore */}
                {fileRawData?.data?.file?.data?.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column}>{row[column]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
