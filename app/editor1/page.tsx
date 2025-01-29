"use client";
import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { Plus, X, Circle, Square, Type, Highlighter } from "lucide-react";

const InteractiveCanvas = () => {
  const [elements, setElements] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);

  const addElement = (type) => {
    const newElement = {
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

  const updateElement = (id, updates) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    );
  };

  const removeElement = (id) => {
    setElements(elements.filter((el) => el.id !== id));
  };

  const renderElementContent = (element) => {
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

  return (
    <div className="relative w-full h-[600px] border">
      <div className="absolute top-2 left-2 z-10 flex space-x-2">
        <button
          className={`p-2 ${selectedTool === "text" ? "bg-blue-200" : "bg-gray-100"}`}
          onClick={() => {
            addElement("text");
            setSelectedTool("text");
          }}
        >
          <Type />
        </button>
        <button
          className={`p-2 ${selectedTool === "circle" ? "bg-blue-200" : "bg-gray-100"}`}
          onClick={() => {
            addElement("circle");
            setSelectedTool("circle");
          }}
        >
          <Circle />
        </button>
        <button
          className={`p-2 ${selectedTool === "square" ? "bg-blue-200" : "bg-gray-100"}`}
          onClick={() => {
            addElement("square");
            setSelectedTool("square");
          }}
        >
          <Square />
        </button>
        <button
          className={`p-2 ${selectedTool === "line" ? "bg-blue-200" : "bg-gray-100"}`}
          onClick={() => {
            addElement("line");
            setSelectedTool("line");
          }}
        >
          Line
        </button>
        <button
          className={`p-2 ${selectedTool === "highlight-opaque" ? "bg-blue-200" : "bg-gray-100"}`}
          onClick={() => {
            addElement("highlight-opaque");
            setSelectedTool("highlight-opaque");
          }}
        >
          Opaque Highlight
        </button>
        <button
          className={`p-2 ${selectedTool === "highlight-transparent" ? "bg-blue-200" : "bg-gray-100"}`}
          onClick={() => {
            addElement("highlight-transparent");
            setSelectedTool("highlight-transparent");
          }}
        >
          Transparent Highlight
        </button>
      </div>

      {elements.map((element) => (
        <Rnd
          key={element.id}
          size={{ width: element.width, height: element.height }}
          position={{ x: element.x, y: element.y }}
          onDragStop={(e, d) => {
            updateElement(element.id, { x: d.x, y: d.y });
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            updateElement(element.id, {
              width: ref.style.width,
              height: ref.style.height,
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
    </div>
  );
};

export default InteractiveCanvas;
