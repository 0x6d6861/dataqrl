import { Card, CardBody } from "@heroui/card";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
function UploadCompoment(props: { onDrop: (acceptedFiles: File[]) => void }) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("X => ", acceptedFiles);
    props.onDrop(acceptedFiles);
    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      <Card className="min-w-[500px] min-h-[200px]">
        <CardBody className="h-full flex-1">
          <div
            className="border-2 border-dashed rounded-lg p-8 flex-1 flex flex-col items-center justify-center cursor-pointer"
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>
                Drag &#39;n&#39; drop some files here, or click to select files
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default UploadCompoment;
