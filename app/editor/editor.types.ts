export type ElementType =
  | 'text'
  | 'circle'
  | 'square'
  | 'line'
  | 'highlight-opaque'
  | 'highlight-transparent';

export interface CanvasElement {
  id: number;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  style?: React.CSSProperties;
  color?: string;
  page?: number;
}

export interface FileRecord {
  file: File;
  type: string;
  name: string;
}
