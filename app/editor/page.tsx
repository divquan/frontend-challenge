"use client";

import { useFiles } from "@/hooks/useFile";
import { pdfjs, Document, Page } from "react-pdf";
import { useState } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { Rnd, RndResizeCallback, RndDragCallback } from "react-rnd";
import { Plus, X, Circle, Square, Type, Highlighter } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ElementType =
  | "text"
  | "circle"
  | "square"
  | "line"
  | "highlight-opaque"
  | "highlight-transparent";

interface CanvasElement {
  id: number;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  style?: React.CSSProperties;
}
export default function Home() {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const addText = () => {
    console.log("add  tet");
  };
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<ElementType | null>(null);

  const addElement = (type: ElementType) => {
    const newElement: CanvasElement = {
      id: Date.now(),
      type,
      x: Math.random() * 600,
      y: Math.random() * 400,
      width: type === "text" ? 200 : 100,
      height: type === "text" ? 50 : 100,
      content: type === "text" ? "Edit me" : "",
      style: type.includes("highlight")
        ? {
            backgroundColor:
              type === "highlight-opaque"
                ? "rgba(255, 255, 0, 0.5)"
                : "rgba(255, 255, 0, 0.2)",
          }
        : {},
    };
    setElements([...elements, newElement]);
  };

  const updateElement = (id: number, updates: Partial<CanvasElement>) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    );
  };

  const removeElement = (id: number) => {
    setElements(elements.filter((el) => el.id !== id));
  };

  const renderElementContent = (element: CanvasElement) => {
    switch (element.type) {
      case "text":
        return (
          <textarea
            className="w-full h-full bg-transparent resize-none p-1"
            value={element.content}
            onChange={(e) =>
              updateElement(element.id, { content: e.target.value })
            }
          />
        );
      case "circle":
        return <div className="w-full h-full rounded-full bg-blue-500"></div>;
      case "square":
        return <div className="w-full h-full bg-green-500"></div>;
      case "line":
        return <div className="w-full h-0.5 bg-red-500"></div>;
      default:
        return null;
    }
  };
  const [pdf] = useFiles();
  return (
    <div className="grid grid-cols-12 max-h-screen p-8  gap-8 font-[family-name:var(--font-geist-sans)] h-screen">
      <aside
        className={
          "border border-muted-foreground/50 h-full w-full rounded-xl p-3 flex flex-col  shadow-white col-span-4  "
        }
      >
        <div className={"w-full  grid grid-cols-4 gap-4 "}>
          {(
            [
              "text",
              "circle",
              "square",
              "line",
              "highlight-opaque",
              "highlight-transparent",
            ] as ElementType[]
          ).map((type) => (
            <Button
              variant={selectedTool === type ? "secondary" : "ghost"}
              key={type}
              className={`p-2 aspect-square  w-full h-auto ${selectedTool === type ? "bg-blue-200" : "bg-gray-100"}`}
              onClick={() => {
                addElement(type);
                setSelectedTool(type);
              }}
            >
              {type === "text" ? (
                <Type />
              ) : type === "circle" ? (
                <Circle />
              ) : type === "square" ? (
                <Square />
              ) : (
                type
              )}
            </Button>
          ))}
        </div>
      </aside>
      <aside
        className={
          "border border-muted-foreground/50 h-full w-full rounded-xl col-span-8 overflow-scroll"
        }
      >
        <div>
          {elements.map((element) => (
            <Rnd
              className={"z-40"}
              key={element.id}
              size={{ width: element.width, height: element.height }}
              position={{ x: element.x, y: element.y }}
              onDragStop={(e, d) => {
                updateElement(element.id, { x: d.x, y: d.y });
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                updateElement(element.id, {
                  width: parseInt(ref.style.width, 10),
                  height: parseInt(ref.style.height, 10),
                  ...position,
                });
              }}
              style={element.style}
              bounds="parent"
            >
              <div className="w-full h-full relative">
                {renderElementContent(element)}
                <button
                  className="absolute top-0 right-0 bg-red-500 text-white p-1"
                  onClick={() => removeElement(element.id)}
                >
                  <X size={16} />
                </button>
              </div>
            </Rnd>
          ))}
          {pdf && (
            <Document
              file={pdf.file}
              onLoadSuccess={onDocumentLoadSuccess}
              className={"p-8 flex flex-col  items-center"}
            >
              <Page pageNumber={pageNumber} />
            </Document>
          )}
          <p>
            Page {pageNumber} of {numPages}
          </p>
        </div>
      </aside>
    </div>
  );
}

// Helper function to download files
// const downloadFile = (file: FileRecord) => {
//   const url = URL.createObjectURL(file.file);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = file.name;
//   link.click();
//   URL.revokeObjectURL(url); // Clean up the object URL
// };
