"use client";
import { FileRecord } from "@/db/db";
import { useFiles } from "@/hooks/useFile";

import React, { useState } from "react";
import {
  File,
  MoreHorizontal,
  FileText,
  FilePdf,
  FileSpreadsheet,
} from "lucide-react";

const fileIcons = {
  txt: FileText,
  pdf: FilePdf,
  xlsx: FileSpreadsheet,
  default: File,
};

const FileList = () => {
  const [files, setFiles] = useState([
    {
      id: 1,
      name: "Very Long Project Proposal Document with Multiple Words",
      type: "pdf",
      size: "245 KB",
    },
    {
      id: 2,
      name: "Extremely Detailed Budget Spreadsheet Report 2024",
      type: "xlsx",
      size: "87 KB",
    },
    {
      id: 3,
      name: "Comprehensive Meeting Notes from Last Quarter",
      type: "txt",
      size: "12 KB",
    },
  ]);

  const handleDelete = (id) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">My Files</h2>
      <div className="space-y-2">
        {files.map((file) => {
          const FileIcon = fileIcons[file.type] || fileIcons["default"];
          return (
            <div
              key={file.id}
              className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition-colors"
            >
              <div className="flex items-center space-x-4 min-w-0">
                <FileIcon className="text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div
                    className="font-medium truncate max-w-[300px]"
                    title={file.name}
                  >
                    {file.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {file.type.toUpperCase()} • {file.size}
                  </div>
                </div>
              </div>
              <div
                onClick={() => handleDelete(file.id)}
                className="cursor-pointer p-2 hover:bg-gray-100 rounded-full"
              >
                <MoreHorizontal className="text-gray-500" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileList;
