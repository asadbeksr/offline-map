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
        <div className='bg-red-500 fixed bottom-0 text-green-500'>You are currently offline.</div>
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
