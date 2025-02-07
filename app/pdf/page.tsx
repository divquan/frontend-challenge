'use client';

import { useFiles } from '@/hooks/useFile';
import { pdfjs, Document, Page } from 'react-pdf';
import { Suspense, useCallback, useEffect, useState } from 'react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { Rnd, RndResizeCallback, RndDragCallback } from 'react-rnd';
import {
  Plus,
  X,
  Circle,
  Square,
  Type,
  Highlighter,
  ArrowRight,
  ArrowLeft,
  GalleryHorizontal,
  ZoomOut,
  ZoomIn,
  MaximizeIcon,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { FileRecord } from '@/db/db';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ElementType =
  | 'text'
  | 'circle'
  | 'square'
  | 'line'
  | 'highlight-opaque'
  | 'highlight-transparent';

interface CanvasElement {
  id: number;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  style?: React.CSSProperties;
  color?: string;
}

export default function MainPage() {
  return (
    <Suspense fallback={'loading...'}>
      <EditorComponent />
    </Suspense>
  );
}
function EditorComponent() {
  const FID = useSearchParams().get('fid');
  const [pdfFileData, setPDFFileData] = useState<FileRecord | null>(null);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }
  const handlePageLoadSuccess = ({ width }) => {
    setPageWidth(width);
  };
  const fitToWidth = () => {
    if (pageWidth) {
      const container = document.querySelector('.pdf-container');
      const containerWidth = container.clientWidth - 64; // Account for padding
      const newScale = containerWidth / pageWidth;
      setScale(newScale);
    }
  };

  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<ElementType | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<null | number>(
    null
  );
  const addElement = (type: ElementType) => {
    const newElement: CanvasElement = {
      id: Date.now(),
      type,
      x: Math.random() * 600,
      y: Math.random() * 400,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 50 : 100,
      content: type === 'text' ? 'Edit me' : '',
      style: type.includes('highlight')
        ? {
            backgroundColor:
              type === 'highlight-opaque'
                ? 'rgba(255, 255, 0, 0.5)'
                : 'rgba(255, 255, 0, 0.2)',
          }
        : {},
    };
    setSelectedElementId(newElement.id);
    setElements([...elements, newElement]);
  };

  const updateElement = (id: number, updates: Partial<CanvasElement>) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const removeElement = (id: number) => {
    setElements(elements.filter((el) => el.id !== id));
    setSelectedElementId((prevId) => (id === prevId ? null : prevId));
  };

  const renderElementContent = (element: CanvasElement) => {
    switch (element.type) {
      case 'text':
        return (
          <textarea
            className='w-full h-full bg-transparent resize-none p-1'
            value={element.content}
            onChange={(e) =>
              updateElement(element.id, { content: e.target.value })
            }
          />
        );
      case 'circle':
        return (
          <div
            className='w-full h-full rounded-full '
            style={{ backgroundColor: element.color }}></div>
        );
      case 'square':
        return (
          <div
            className='w-full h-full  aspect-square'
            style={{ backgroundColor: element.color }}></div>
        );
      case 'line':
        return (
          <div
            className='w-full h-0.5 '
            style={{ backgroundColor: element.color }}></div>
        );
      default:
        return null;
    }
  };
  const { getFile } = useFiles();

  useEffect(() => {
    console.log(FID, 'fileId');
    if (!FID) return;
    getFile(FID).then((file) => {
      setPDFFileData(file ? file : null);
    });
  }, [FID]);
  const selectedElement =
    useCallback(() => {
      if (!selectedElementId) return null;
      return elements.find((el) => el.id === selectedElementId);
    }, [selectedElementId, elements]) || null;
  if (!pdfFileData) return <>Setting up</>;
  const tools = [
    { type: 'text', icon: <Type className='w-5 h-5' /> },
    { type: 'circle', icon: <Circle className='w-5 h-5' /> },
    { type: 'square', icon: <Square className='w-5 h-5' /> },
    { type: 'line', icon: <GalleryHorizontal className='w-5 h-5' /> },
    { type: 'highlight-opaque', icon: '✨' },
    { type: 'highlight-transparent', icon: '○' },
  ];

  return (
    <div className='grid grid-cols-12 max-h-screen p-8  gap-8 font-[family-name:var(--font-geist-sans)] h-screen'>
      <aside
        className={
          'border border-muted-foreground/50 h-full w-full rounded-xl p-3 flex flex-col  shadow-white col-span-4  '
        }>
        <div className='grid grid-cols-3 md:grid-cols-6 gap-2'>
          {tools.map(({ type, icon }) => (
            <Button
              key={type}
              variant={selectedTool === type ? 'secondary' : 'ghost'}
              className={`aspect-square p-2 ${
                selectedTool === type
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'hover:bg-secondary/80'
              }`}
              onClick={() => {
                addElement(type);
                setSelectedTool(type);
              }}>
              <div className='flex items-center justify-center w-full h-full'>
                {icon}
              </div>
            </Button>
          ))}
        </div>

        {selectedElementId ? (
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold text-muted-foreground'>
              Element Properties
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {[
                { label: 'X Position', key: 'x' as const },
                { label: 'Y Position', key: 'y' as const },
                { label: 'Width', key: 'width' as const },
                { label: 'Height', key: 'height' as const },
              ].map(({ label, key }) => (
                <div key={key} className='space-y-2'>
                  <label className='text-sm font-medium'>{label}</label>
                  <Input
                    type='number'
                    value={selectedElement()?.[key]}
                    className='w-full'
                    onChange={(e) => {
                      updateElement(selectedElementId, {
                        [key]: parseInt(e.target.value),
                      });
                    }}
                  />
                </div>
              ))}
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Color</label>
              <div className='flex items-center gap-3'>
                <input
                  type='color'
                  value={selectedElement()?.color || '#000000'}
                  className='w-12 h-8 cursor-pointer'
                  onChange={(e) => {
                    updateElement(selectedElementId, {
                      color: e.target.value,
                    });
                  }}
                />
                <Input
                  type='text'
                  placeholder='#000000'
                  value={selectedElement()?.color || ''}
                  className='flex-1'
                  onChange={(e) => {
                    updateElement(selectedElementId, {
                      color: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className='text-sm text-muted-foreground text-center py-4'>
            No element selected
          </div>
        )}
      </aside>
      <ScrollArea className='border border-muted-foreground/50 w-full h-full rounded-xl relative pdf-container col-span-8'>
        <div className='bg-gray-400 min-h-full'>
          {pdfFileData && (
            <Document
              file={pdfFileData.file}
              onLoadSuccess={onDocumentLoadSuccess}
              className='p-8 flex flex-col items-center'>
              <div className='relative'>
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  onLoadSuccess={handlePageLoadSuccess}
                  className='shadow-xl'>
                  {elements.map((element) => (
                    <Rnd
                      key={element.id}
                      className='group'
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
                      bounds='parent'
                      scale={scale}
                      style={{
                        ...element.style,
                        zIndex: 40,
                      }}>
                      <div
                        className='w-full h-full relative rounded-md ring-1 ring-black/10 hover:ring-2 hover:ring-primary/50'
                        onClick={() => setSelectedElementId(element.id)}>
                        {renderElementContent(element)}
                        <button
                          className='absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10'
                          onClick={(e) => {
                            e.stopPropagation();
                            removeElement(element.id);
                          }}>
                          <X size={14} />
                        </button>
                      </div>
                    </Rnd>
                  ))}
                </Page>
              </div>
            </Document>
          )}
        </div>

        <div className='fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white p-3 rounded-lg shadow-2xl z-50'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}>
            <ArrowLeft className='h-4 w-4' />
          </Button>

          <span className='text-sm min-w-[100px] text-center'>
            Page {pageNumber} of {numPages}
          </span>

          <Button
            variant='ghost'
            size='icon'
            onClick={() =>
              setPageNumber(Math.min(numPages ?? 0, pageNumber + 1))
            }
            disabled={pageNumber >= (numPages ?? 0)}>
            <ArrowRight className='h-4 w-4' />
          </Button>

          <div className='h-6 w-px bg-gray-200' />

          <Button
            variant='ghost'
            size='icon'
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}>
            <ZoomOut className='h-4 w-4' />
          </Button>

          <div className='flex items-center gap-2'>
            <Slider
              value={[scale * 100]}
              min={50}
              max={200}
              step={10}
              className='w-[100px]'
              onValueChange={([value]) => setScale(value / 100)}
            />
            <span className='text-sm min-w-[60px]'>
              {Math.round(scale * 100)}%
            </span>
          </div>

          <Button
            variant='ghost'
            size='icon'
            onClick={() => setScale(Math.min(2, scale + 0.1))}>
            <ZoomIn className='h-4 w-4' />
          </Button>

          <div className='h-6 w-px bg-gray-200' />

          <Button variant='ghost' size='icon' onClick={fitToWidth}>
            <MaximizeIcon className='h-4 w-4' />
          </Button>
        </div>
      </ScrollArea>
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
