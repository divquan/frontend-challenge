import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  MaximizeIcon,
} from 'lucide-react';

interface ViewerControlsProps {
  pageNumber: number;
  numPages: number;
  scale: number;
  onPageChange: (page: number) => void;
  onScaleChange: (scale: number) => void;
  onFitToWidth: () => void;
}

export const ViewerControls = ({
  pageNumber,
  numPages,
  scale,
  onPageChange,
  onScaleChange,
  onFitToWidth,
}: ViewerControlsProps) => (
  <div className='fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white p-3 rounded-lg shadow-2xl z-50'>
    <Button
      variant='ghost'
      size='icon'
      onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
      disabled={pageNumber <= 1}>
      <ArrowLeft className='h-4 w-4' />
    </Button>

    <span className='text-sm min-w-[100px] text-center'>
      Page {pageNumber} of {numPages}
    </span>

    <Button
      variant='ghost'
      size='icon'
      onClick={() => onPageChange(Math.min(numPages ?? 0, pageNumber + 1))}
      disabled={pageNumber >= (numPages ?? 0)}>
      <ArrowRight className='h-4 w-4' />
    </Button>

    <div className='h-6 w-px bg-gray-200' />

    <Button
      variant='ghost'
      size='icon'
      onClick={() => onScaleChange(Math.max(0.5, scale - 0.1))}>
      <ZoomOut className='h-4 w-4' />
    </Button>

    <div className='flex items-center gap-2'>
      <Slider
        value={[scale * 100]}
        min={50}
        max={200}
        step={10}
        className='w-[100px]'
        onValueChange={([value]) => onScaleChange(value / 100)}
      />
      <span className='text-sm min-w-[60px]'>{Math.round(scale * 100)}%</span>
    </div>

    <Button
      variant='ghost'
      size='icon'
      onClick={() => onScaleChange(Math.min(2, scale + 0.1))}>
      <ZoomIn className='h-4 w-4' />
    </Button>

    <div className='h-6 w-px bg-gray-200' />

    <Button variant='ghost' size='icon' onClick={onFitToWidth}>
      <MaximizeIcon className='h-4 w-4' />
    </Button>
  </div>
);
