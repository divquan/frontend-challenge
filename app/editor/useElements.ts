'use client';

import { useState, useCallback, useEffect } from 'react';
import { CanvasElement, ElementType } from './editor.types';
import db from '@/db/db';

export const useElements = (FID: string | null) => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<number | null>(
    null
  );
  const [selectedTool, setSelectedTool] = useState<ElementType | null>(null);

  const addElement = useCallback((type: ElementType, page?: number) => {
    const newElement: CanvasElement = {
      id: Date.now(),
      type,
      x: Math.random() * 600,
      y: Math.random() * 400,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 50 : 100,
      content: type === 'text' ? 'Edit me' : '',
      color: '#7B7B7B',
      style: type.includes('highlight')
        ? {
            backgroundColor:
              type === 'highlight-opaque'
                ? 'rgba(255, 255, 0, 0.5)'
                : 'rgba(255, 255, 0, 0.2)',
          }
        : {},
      page: page ?? 1,
    };
    setSelectedElementId(newElement.id);
    setElements((prev) => [...prev, newElement]);
  }, []);

  const updateElement = useCallback(
    (id: number, updates: Partial<CanvasElement>) => {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
      );
    },
    []
  );

  const removeElement = useCallback((id: number) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedElementId((prevId) => (id === prevId ? null : prevId));
  }, []);

  const getSelectedElement = useCallback(() => {
    if (!selectedElementId) return null;
    return elements.find((el) => el.id === selectedElementId);
  }, [selectedElementId, elements]);
  const handleSave = async () => {
    if (!FID) return;
    const res = await db.files.update(FID, { elements });
    console.log('handleSave res: ', res);
  };

  useEffect(() => {
    (async () => {
      if (!FID) return;
      const res = await db.files.get(FID);
      if (!res) return;
      setElements(res.elements ?? []);
    })();
  }, [FID]);
  return {
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
  };
};
