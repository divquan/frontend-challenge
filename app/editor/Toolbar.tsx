import { Button } from '@/components/ui/button';
import { ElementType } from './editor.types';
import { Circle, Square, Type, GalleryHorizontal } from 'lucide-react';

interface ToolbarProps {
  selectedTool: ElementType | null;
  onToolSelect: (type: ElementType) => void;
}

export const Toolbar = ({ selectedTool, onToolSelect }: ToolbarProps) => {
  const tools = [
    { type: 'text' as ElementType, icon: <Type className='w-5 h-5' /> },
    { type: 'circle' as ElementType, icon: <Circle className='w-5 h-5' /> },
    { type: 'square' as ElementType, icon: <Square className='w-5 h-5' /> },
    {
      type: 'line' as ElementType,
      icon: <GalleryHorizontal className='w-5 h-5' />,
    },
    { type: 'highlight-opaque' as ElementType, icon: '✨' },
    { type: 'highlight-transparent' as ElementType, icon: '○' },
  ];

  return (
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
          onClick={() => onToolSelect(type)}>
          <div className='flex items-center justify-center w-full h-full'>
            {icon}
          </div>
        </Button>
      ))}
    </div>
  );
};
