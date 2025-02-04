import EventSourcing, { UploadedFile } from "@/components/ui/EventSourcing";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      {/* <Navbar /> */}
      <main className="px-6 flex-grow pt-16 flex flex-row items-center">
        <div className="flex-1 h-full">{children}</div>
      </main>
      {/* <footer className="w-full flex items-center justify-center py-3">
    
      </footer> */}
      <EventSourcing
        onUpload={function (file: UploadedFile): void {
          console.log("File => ", file)
          // throw new Error("Function not implemented.");
        }}
      />
    </div>
  );
}
