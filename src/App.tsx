import { useEffect, useState } from 'react';
import { loadFromLocalStorage } from '@/lib/utils';
import useMapStore from '@/store/mapStore';
import { points as defaultPoints } from '@/lib/data'; 
// import { MapComponent } from './components/map';

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { setPoints } = useMapStore();

  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    // Load points from local storage
    const storedPoints = loadFromLocalStorage('points');

    // Check if there are stored points; if not, set default points
    if (!storedPoints || storedPoints.length === 0) {
      setPoints(defaultPoints); // Set default points if no stored points
    } else {
      setPoints(storedPoints); // Set stored points
    }
  }, [setPoints]);

  return (
    <div className='app-container'>
      {isOffline && (
        <div className='bg-red-500 text-white font-bold fixed z-10 bottom-0 w-full h-10 mx-auto flex justify-center self-center items-center'>
          You are currently offline.
        </div>
      )}
      {/* <MapComponent zoom={8} points={useMapStore.getState().points} /> */}
    </div>
  );
}

export default App;
