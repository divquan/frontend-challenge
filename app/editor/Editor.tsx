"use client";
import { useFiles } from "@/hooks/useFile";
import { Toolbar } from "./Toolbar";
import { ElementProperties } from "./ElementProperties";
import { ViewerControls } from "./ViewerControls";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { FileRecord } from "@/db/db";
import { useElements } from "./useElements";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { CanvasElement } from "./editor.types";
import { X } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { DocViewer, ExcelViewer } from "../pdf/page";
import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function Editor() {
  const FID = useSearchParams().get("fid");
  const [pdfFileData, setPDFFileData] = useState<FileRecord | null>(null);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const {
    elements,
    selectedElementId,
    selectedTool,
    setSelectedTool,
    setSelectedElementId,
    addElement,
    updateElement,
    removeElement,
    getSelectedElement,
    handleSave,
  } = useElements(FID);

  const { getFile } = useFiles();

  useEffect(() => {
    if (!FID) return;
    getFile(FID).then((file) => {
      console.log("file", file);
      if (file) setPDFFileData(file);
    });
  }, [FID]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    // Auto fit to width on initial load
    // if (imageContainerRef.current) {
    //   const containerWidth = imageContainerRef.current.clientWidth - 64; // Account for padding

    //   const newScale = containerWidth / img.naturalWidth;
    //   console.log('container width', containerWidth);
    //   console.log('image width', img.naturalWidth);
    //   setScale(newScale);
    // }
  };
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }
  const handlePageLoadSuccess = ({ width }: { width: number }) => {
    setPageWidth(width);
  };
  const renderContent = () => {
    if (!pdfFileData) return;
    if (pdfFileData.type === "application/pdf") {
      return (
        <Document
          file={pdfFileData.file}
          onLoadSuccess={onDocumentLoadSuccess}
          className="p-8 flex flex-col items-center"
        >
          <div className="relative">
            <Page
              pageNumber={pageNumber}
              scale={scale}
              onLoadSuccess={handlePageLoadSuccess}
            >
              {renderElements()}
            </Page>
          </div>
        </Document>
      );
    } else if (
      pdfFileData.type === "image/jpeg" ||
      pdfFileData.type === "image/png"
    ) {
      return (
        <div className="p-8 flex flex-col items-center">
          <div className="relative" ref={imageContainerRef}>
            <img
              src={URL.createObjectURL(pdfFileData.file)}
              onLoad={handleImageLoad}
              style={{
                width: imageSize.width,
                height: "auto",
                objectFit: "contain",
              }}
              className="shadow-xl"
              alt="Uploaded content"
            />
            {renderElements()}
          </div>
        </div>
      );
    } else if (
      pdfFileData.type === "application/msword" ||
      pdfFileData.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <>
          <DocViewer file={pdfFileData.file} renderElements={renderElements} />
          {renderElements()}
        </>
      );
    } else if (
      pdfFileData.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return (
        <div className="bg-white">
          <ExcelViewer file={pdfFileData.file} />
          {renderElements()}
        </div>
      );
    }
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
        return (
          <div
            className="w-full h-full rounded-full "
            style={{ backgroundColor: element.color }}
          ></div>
        );
      case "square":
        return (
          <div
            className="w-full h-full  aspect-square"
            style={{ backgroundColor: element.color }}
          ></div>
        );
      case "line":
        return (
          <div
            className="w-full h-0.5 "
            style={{ backgroundColor: element.color }}
          ></div>
        );
      default:
        return null;
    }
  };
  const renderElements = () => {
    return elements.map((element) => {
      if (element.page !== pageNumber) return null;
      return (
        <Rnd
          key={element.id}
          className="group"
          size={{
            width: element.width * scale,
            height: element.height * scale,
          }}
          position={{
            x: element.x * scale,
            y: element.y * scale,
          }}
          onDragStop={(e, d) => {
            updateElement(element.id, {
              x: d.x / scale,
              y: d.y / scale,
            });
            setSelectedElementId(element.id);
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            updateElement(element.id, {
              width: parseInt(ref.style.width, 10) / scale,
              height: parseInt(ref.style.height, 10) / scale,
              x: position.x / scale,
              y: position.y / scale,
            });
            setSelectedElementId(element.id);
          }}
          bounds="parent"
          scale={scale}
          style={{
            ...element.style,
            zIndex: 40,
          }}
        >
          <div
            className="w-full h-full relative rounded-md ring-1 ring-black/10 hover:ring-2 hover:ring-primary/50"
            onClick={() => setSelectedElementId(element.id)}
          >
            {renderElementContent(element)}
            <button
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
              onClick={(e) => {
                e.stopPropagation();
                removeElement(element.id);
              }}
            >
              <X size={14} />
            </button>
          </div>
        </Rnd>
      );
    });
  };

  // Modify the fitToWidth function to work with both PDFs and images
  const fitToWidth = () => {
    if (!pdfFileData) return;
    if (imageContainerRef.current) {
      const containerWidth = imageContainerRef.current.clientWidth - 64;
      const contentWidth =
        pdfFileData.type === "application/pdf" ? pageWidth : imageSize.width;

      if (contentWidth) {
        const newScale = containerWidth / contentWidth;
        setScale(newScale);
      }
    }
  };

  return (
    <div className="grid grid-cols-12 max-h-screen p-8 gap-8 font-[family-name:var(--font-geist-sans)] h-screen">
      <aside className="border border-muted-foreground/50 h-full w-full rounded-xl p-3 flex flex-col shadow-white col-span-4">
        <Toolbar
          selectedTool={selectedTool}
          onToolSelect={(type) => {
            addElement(type, pageNumber);
            setSelectedTool(type);
          }}
        />
        <ElementProperties
          element={getSelectedElement() ?? null}
          onUpdate={(updates) => {
            if (selectedElementId) {
              updateElement(selectedElementId, updates);
            }
          }}
        />
        <Button onClick={handleSave}>Save</Button>
      </aside>

      <ScrollArea className="border border-muted-foreground/50 w-full h-full rounded-xl relative pdf-container col-span-8">
        <div className="bg-gray-400 min-h-full">
          {renderContent()}
          {pdfFileData?.file.type === "pdf" && (
            <ViewerControls
              pageNumber={pageNumber}
              numPages={numPages ?? 0}
              scale={scale}
              onPageChange={setPageNumber}
              onScaleChange={setScale}
              onFitToWidth={fitToWidth}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
