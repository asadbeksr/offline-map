import React, { useEffect, useState } from 'react';
import useMapStore from '@/store/mapStore';
import { Button } from './button';
import { Input } from './input';
import { Checkbox } from './checkbox';

const Popup: React.FC = () => {
  const activePoint = useMapStore((state) => state.activePoint);
  const updatePoint = useMapStore((state) => state.updatePoint);

  const [details, setDetails] = useState(activePoint?.details || '');
  const [status, setStatus] = useState(activePoint?.status || false);

  useEffect(() => {
    if (activePoint) {
      setDetails(activePoint.details);
      setStatus(activePoint.status);
    }
  }, [activePoint]); 

  if (!activePoint) {
    return null; 
  }

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails(e.target.value);
  };

  const handleStatusChange = (checked: boolean) => {
    setStatus(checked);
  };

  const handleSave = () => {
    updatePoint({ id: activePoint.id, details, status });
  };

  return (
    <div className='pb-2'>
      <div className='flex justify-between items-center mb-2'>
        <h2 className='text-lg font-semibold'>Edit Comment</h2>
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-1'>
          Comment:
          <Input
            data-cy='comment-input'
            type='text'
            value={details} 
            onChange={handleDetailsChange}
            className='mt-1 block w-full border rounded-md p-2 shadow-sm focus:ring focus:ring-blue-300'
          />
        </label>
      </div>
      <div className='mb-4'>
        <label className='flex items-center gap-1'>
          <Checkbox
            data-cy='status-checkbox'
            checked={status}
            onCheckedChange={handleStatusChange}
            className='mr-2'
          />
          <span className='text-sm font-medium'>
            {status ? 'Positive' : 'Negative'}
          </span>
        </label>
      </div>
      <Button onClick={handleSave} className='w-full' data-cy='save-button'>
        Save
      </Button>
    </div>
  );
};

export default Popup;
