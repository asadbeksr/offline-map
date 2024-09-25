import MapComponent from './components/Map';

function App() {
  return (
    <div>
      <MapComponent />
      <div id='popup' className='ol-popup' style={{ backgroundColor: '#fff' }}>
        <a href='#' id='popup-closer' className='ol-popup-closer'></a>
        <div id='popup-content'></div>
      </div>
    </div>
  );
}

export default App;
