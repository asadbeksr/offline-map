import { useEffect, useState } from 'react';
import MapComponent from './components/Map';

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return (
    <div>
       {isOffline && (
        <div className='bg-red-500 text-white font-bold fixed z-10 bottom-0 w-full h-10 mx-auto flex justify-center self-center items-center'>
          You are currently offline.
        </div>
      )}

      <MapComponent />
      <div id='popup' className='ol-popup' style={{ backgroundColor: '#fff' }}>
        <a href='#' id='popup-closer' className='ol-popup-closer'></a>
        <div id='popup-content'></div>
      </div>
    </div>
  );
}

export default App;
