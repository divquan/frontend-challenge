"use client";
import { useRef } from "react";
import db, { AllowedFileType, FileRecord } from "@/db/db";
import { useFiles } from "@/hooks/useFile";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // const [file, setFile] = useState<File | null>(null);
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const allowedFileTypes: AllowedFileType[] = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "application/vnd.ms-outlook",
  ];

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      if (!allowedFileTypes.includes(selectedFile.type as AllowedFileType)) {
        alert("Invalid file type! Please select a valid file.");
        return;
      }
      if (!selectedFile) return;

      const fileType = selectedFile.type as AllowedFileType; // Type assertion is safe here because of earlier validation

      try {
        const id = crypto.randomUUID();
        await db.files.add({
          id,
          name: selectedFile.name,
          type: fileType,
          file: selectedFile,
        });
        alert("File uploaded successfully!");
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  return (
    <div className="grid grid-cols-12 min-h-screen p-8  gap-8 font-[family-name:var(--font-geist-sans)]">
      <aside
        className={
          "border border-gray-700 h-full w-full rounded-xl p-3 flex flex-col justify-end shadow-white col-span-4 "
        }
      >
        <div className={"flex-1"}>
          <FileGrid />
        </div>
        <button
          type="button"
          className="w-full bg-gray-800 hover:bg-gray-800/80 py-2"
          onClick={handleClick}
        >
          Upload
        </button>
        <input
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          name="upload-file"
          type="file"
          id="upload-file"
        />
      </aside>
      <aside
        className={"border border-gray-700 h-full w-full rounded-xl col-span-8"}
      ></aside>
    </div>
  );
}

const FileGrid = () => {
  const files = useFiles(); // Get the files from the hook

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {files.length === 0 ? (
        <p>No files found!</p>
      ) : (
        files.map((file) => (
          <div key={file.id} className="p-4 border rounded shadow-md">
            <p className="font-bold">{file.name}</p>
            <p className="text-sm text-gray-500">{file.type}</p>
            <button
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => downloadFile(file)}
            >
              Download
            </button>
          </div>
        ))
      )}
    </div>
  );
};

// Helper function to download files
const downloadFile = (file: FileRecord) => {
  const url = URL.createObjectURL(file.file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url); // Clean up the object URL
};
