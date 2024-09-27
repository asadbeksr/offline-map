import React, { useEffect, useState } from 'react';
import useMapStore from '@/store/mapStore';
import { Button } from './button';
import { Input } from './input';
import { Checkbox } from './checkbox';

const Popup: React.FC = () => {
  const activePoint = useMapStore((state) => state.activePoint);
  const updatePoint = useMapStore((state) => state.updatePoint);

  // Local state for details and status
  const [details, setDetails] = useState(activePoint?.details || '');
  const [status, setStatus] = useState(activePoint?.status || false);

  useEffect(() => {
    if (activePoint) {
      setDetails(activePoint.details);
      setStatus(activePoint.status);
    }
  }, [activePoint]); // Reset state when activePoint changes

  if (!activePoint) {
    return null; // If no point is active, return null
  }

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails(e.target.value);
  };

  const handleStatusChange = (checked: boolean) => {
    setStatus(checked);
  };

  const handleSave = () => {
    // Update the point with the current values in local state
    updatePoint({ id: activePoint.id, details, status });
  };

  return (
    <div className='pb-2'>
      <div className='flex justify-between items-center mb-2'>
        <h2 className='text-lg font-semibold'>Edit Point</h2>
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-1'>
          Comment:
          <Input
            type='text'
            value={details} // Controlled input
            onChange={handleDetailsChange}
            className='mt-1 block w-full border rounded-md p-2 shadow-sm focus:ring focus:ring-blue-300'
          />
        </label>
      </div>
      <div className='mb-4'>
        <label className='flex items-center gap-1'>
          <Checkbox
            checked={status}
            onCheckedChange={handleStatusChange}
            className='mr-2'
          />
          <span className='text-sm font-medium'>
            {status ? 'Active' : 'Inactive'}
          </span>
        </label>
      </div>
      <Button onClick={handleSave} className='w-full'>
        Save
      </Button>
    </div>
  );
};

export default Popup;
