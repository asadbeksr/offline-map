import React, { useEffect, useState } from 'react';
import useMapStore from '@/store/mapStore';
import { Button } from './button';

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

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus(e.target.checked);
  };

  const handleSave = () => {
    // Update the point with the current values in local state
    updatePoint({ id: activePoint.id, details, status });
  };

  return (
    <div>
      <div id='popup-content'>
        <div>
          <label>
            Details:
            <input
              type='text'
              value={details} // Controlled input
              onChange={handleDetailsChange}
              className='border p-1'
            />
          </label>
        </div>
        <div>
          <label>
            Status:
            <input
              type='checkbox'
              checked={status} // Controlled checkbox
              onChange={handleStatusChange}
            />
          </label>
        </div>
        <Button 
          onClick={handleSave} 
          className='w-full mt-2 text-white p-1 rounded'
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default Popup;
