import { useState } from "react";

import UploadCompoment from "@/components/ui/UploadCompoment";
import DefaultLayout from "@/layouts/default";
import UploadingFile from "@/components/ui/UploadingFile";

export default function IndexPage() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="mb-8">
          <UploadCompoment onDrop={setFiles} />
        </div>

        <div className="space-y-3">
          {files.map((file, index) => (
            <UploadingFile key={`${file.name}-${index}`} file={file} />
          ))}
        </div>
      </section>
    </DefaultLayout>
  );
}
