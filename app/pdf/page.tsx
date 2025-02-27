"use client";
// First, install these packages:
// npm install docx-preview xlsx react-window

import React, { useState, useEffect, EventHandler } from "react";
import { renderAsync } from "docx-preview";
import * as XLSX from "xlsx";
import { FixedSizeGrid } from "react-window";

// DOC/DOCX Viewer Component
export const DocViewer = ({
  file,
  renderElements,
}: {
  file: any;
  renderElements: () => any;
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = document.getElementById("doc-container");
    if (!container) return;
    const renderDoc = async () => {
      try {
        setLoading(true);
        // For docx files
        if (file instanceof Blob) {
          await renderAsync(file, container, container, {
            className: "doc-viewer",
            inWrapper: true,
          });
        }
        // For doc files, you'll need to convert them to docx first
        // This example assumes docx files
      } catch (error) {
        console.error("Error rendering document:", error);
      } finally {
        setLoading(false);
      }
    };

    if (file) {
      renderDoc();
    }
  }, [file]);

  return (
    <div className="w-full h-full">
      {loading && <div className="text-center p-4">Loading document...</div>}
      <div
        id="doc-container"
        className="w-full min-h-[500px] border border-gray-200 rounded-lg"
      />
      {/* {renderElements()} */}
    </div>
  );
};

// Excel Viewer Component
export const ExcelViewer = ({ file }: { file: File | Blob }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const readExcel = async () => {
      try {
        setLoading(true);
        const reader = new FileReader();

        reader.onload = (e: any) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

          setData({
            rows: jsonData.length,
            cols: jsonData[0]?.length || 0,
            content: jsonData,
          });
        };

        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error("Error reading Excel file:", error);
      } finally {
        setLoading(false);
      }
    };

    if (file) {
      readExcel();
    }
  }, [file]);

  const Cell = ({ columnIndex, rowIndex, style }) => (
    <div
      className="p-2 border-r border-b border-gray-200 truncate"
      style={style}
    >
      {data?.content[rowIndex]?.[columnIndex] || ""}
    </div>
  );

  if (loading) {
    return <div className="text-center p-4">Loading spreadsheet...</div>;
  }

  if (!data) {
    return <div className="text-center p-4">No data to display</div>;
  }

  return (
    <div className="w-full h-full border border-gray-200 rounded-lg">
      <FixedSizeGrid
        columnCount={data.cols}
        columnWidth={120}
        height={500}
        rowCount={data.rows}
        rowHeight={35}
        width={800}
      >
        {Cell}
      </FixedSizeGrid>
    </div>
  );
};

const FileViewer = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const renderViewer = () => {
    if (!selectedFile) return null;

    const fileType = selectedFile.name.split(".").pop().toLowerCase();

    switch (fileType) {
      case "doc":
      case "docx":
        return <DocViewer file={selectedFile} />;
      case "xls":
      case "xlsx":
        return <ExcelViewer file={selectedFile} />;
      default:
        return <div>Unsupported file type</div>;
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept=".doc,.docx,.xls,.xlsx"
        onChange={handleFileChange}
        className="mb-4"
      />
      {renderViewer()}
    </div>
  );
};

export default FileViewer;
