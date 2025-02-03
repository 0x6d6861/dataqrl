import { useState, useCallback } from "react";

import UploadCompoment from "@/components/ui/UploadCompoment";
import DefaultLayout from "@/layouts/default";
import FileHandler from "@/components/ui/FileHandler";
import UtilitySection from "@/components/ui/UtilitySection";

export default function IndexPage() {
  const [files, setFiles] = useState<File[]>([]);

  const handleUploadComplete = useCallback((fileId: string, file: File) => {
    // Handle the fileId received after successful upload
    console.log('File uploaded successfully with ID:', fileId, file);
    
    // Remove the file from the list after 5 seconds
    // setTimeout(() => {
    //   setFiles(prevFiles => prevFiles.filter(f => f !== file));
    // }, 5000);
  }, []);

  return (
    <DefaultLayout>
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            File Upload Center
          </h1>
          <p className="text-default-500 max-w-xl mx-auto">
            Drag and drop your files here or click to browse. We support various
            file formats for your convenience.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="p-6 rounded-xl mb-8">
            <UploadCompoment onDrop={setFiles} />
          </div>

          {files.length > 0 && (
            <div className="space-y-3 bg-default-50 p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
              {files.map((file, index) => (
                <FileHandler
                  key={`${file.name}-${index}`}
                  file={file}
                  onUploadComplete={(fileId) => handleUploadComplete(fileId, file)}
                />
              ))}
            </div>
          )}
        </div>

<div>
            <UtilitySection />
</div>

      </section>
    </DefaultLayout>
  );
}
