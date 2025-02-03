import { Card, CardBody } from "@heroui/card";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload } from "lucide-react";

function UploadCompoment(props: { onDrop: (acceptedFiles: File[]) => void }) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    props.onDrop(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Card className="w-full max-w-2xl mx-auto transition-all duration-200 hover:shadow-lg">
      <CardBody className="h-full">
        <div
          className={`border-2 border-dashed rounded-lg p-8 h-[200px] flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
          }`}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <CloudUpload className={`w-12 h-12 mb-4 ${
            isDragActive ? "text-blue-500" : "text-gray-400"
          }`} />
          {isDragActive ? (
            <p className="text-blue-500 font-medium text-lg">
              Drop your files here...
            </p>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 font-medium text-lg mb-2">
                Drag and drop your files here
              </p>
              <p className="text-gray-400 text-sm">
                or click to browse from your computer
              </p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default UploadCompoment;
