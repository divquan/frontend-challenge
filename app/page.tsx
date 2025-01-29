"use client";
// import { FileRecord } from "@/db/db";
import { useFiles } from "@/hooks/useFile";
import React, { useState } from "react";
import {
  File,
  Upload,
  Search,
  Trash2,
  Image,
  FileText,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  FilePen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import db, { AllowedFileType } from "@/db/db";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
//   DialogClose,
// } from "@/components/ui/dialog";

interface FileRecord {
  id: string;
  name: string;
  type: AllowedFileType;
  file: Blob;
}

const FileIcons = {
  image: Image,
  document: FileText,
  spreadsheet: FileSpreadsheet,
  video: FileVideo,
  audio: FileAudio,
  pdf: FilePen,
  default: File,
};

const FileManagementPage: React.FC = () => {
  const files = useFiles();
  const [searchTerm, setSearchTerm] = useState("");
  const [fileToDelete, setFileToDelete] = useState<FileRecord | null>(null);
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
  // const getFileType = (filename: string): AllowedFileType => {
  //   const ext = filename.split(".").pop()?.toLowerCase();
  //   switch (ext) {
  //     case "jpg":
  //     case "jpeg":
  //     case "png":
  //     case "gif":
  //       return "image";
  //     case "doc":
  //     case "docx":
  //     case "txt":
  //       return "document";
  //     case "xls":
  //     case "xlsx":
  //       return "spreadsheet";
  //     case "mp4":
  //     case "avi":
  //     case "mov":
  //       return "video";
  //     case "mp3":
  //     case "wav":
  //       return "audio";
  //     case "pdf":
  //       return "pdf";
  //     default:
  //       return "default";
  //   }
  // };

  const formatFileSize = (file: Blob): string => {
    const sizeInMB = file.size / 1024 / 1024;
    return `${sizeInMB.toFixed(1)} MB`;
  };

  // const handleDelete = () => {
  //   if (fileToDelete) {e
  //     // setFiles(files.filter((file) => file.id !== fileToDelete.id));
  //     setFileToDelete(null);
  //   }
  // };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const FileIcon: React.FC<{ type?: AllowedFileType }> = ({ type }) => {
    const Icon = FileIcons["default"];
    return <Icon className="w-12 h-12 text-gray-500" />;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4 w-full max-w-md">
          <Search className="text-gray-500" />
          <input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
        </div>
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button asChild>
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex items-center"
            >
              <Upload className="mr-2 w-4 h-4" /> Upload
            </label>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <FileIcon type={file.type} />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setFileToDelete(file)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-sm">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-gray-500">{formatFileSize(file.file)}</p>
            </div>
          </div>
        ))}
      </div>

      {/*{fileToDelete && (*/}
      {/*  <Dialog*/}
      {/*    open={!!fileToDelete}*/}
      {/*    onOpenChange={() => setFileToDelete(null)}*/}
      {/*  >*/}
      {/*    <DialogContent>*/}
      {/*      <DialogHeader>*/}
      {/*        <DialogTitle>Delete File</DialogTitle>*/}
      {/*        <DialogDescription>*/}
      {/*          Are you sure you want to delete {fileToDelete.name}?*/}
      {/*        </DialogDescription>*/}
      {/*      </DialogHeader>*/}
      {/*      <DialogFooter>*/}
      {/*        <DialogClose asChild>*/}
      {/*          <Button variant="outline">Cancel</Button>*/}
      {/*        </DialogClose>*/}
      {/*        <Button variant="destructive" onClick={handleDelete}>*/}
      {/*          Delete*/}
      {/*        </Button>*/}
      {/*      </DialogFooter>*/}
      {/*    </DialogContent>*/}
      {/*  </Dialog>*/}
      {/*)}*/}
    </div>
  );
};

export default FileManagementPage;
