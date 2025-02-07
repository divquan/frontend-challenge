import { Input } from '@/components/ui/input';
import { CanvasElement } from './editor.types';

interface ElementPropertiesProps {
  element: CanvasElement | null;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

export const ElementProperties = ({
  element,
  onUpdate,
}: ElementPropertiesProps) => {
  if (!element) {
    return (
      <div className='text-sm text-muted-foreground text-center py-4'>
        No element selected
      </div>
    );
  }

  return (
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
              value={element[key]}
              className='w-full'
              onChange={(e) => onUpdate({ [key]: parseInt(e.target.value) })}
            />
          </div>
        ))}
      </div>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Color</label>
        <div className='flex items-center gap-3'>
          <input
            type='color'
            value={element.color || '#000000'}
            className='w-12 h-8 cursor-pointer'
            onChange={(e) => onUpdate({ color: e.target.value })}
          />
          <Input
            type='text'
            placeholder='#000000'
            value={element.color || ''}
            className='flex-1'
            onChange={(e) => onUpdate({ color: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};
