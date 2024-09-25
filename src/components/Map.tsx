import { useEffect } from 'react';

import { Feature, Map, Overlay, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Point } from 'ol/geom';
import { fromLonLat, toLonLat } from 'ol/proj';
import { toStringHDMS } from 'ol/coordinate';
import { getCenter } from 'ol/extent';

import { points } from '../lib/data';

import ActiveIcon from '../../public/icons/active.svg';
import InactiveIcon from '../../public/icons/inactive.svg';

/**
 * MapComponent is a React functional component that renders an interactive map using OpenLayers.
 * 
 * @component
 * @example
 * return (
 *   <MapComponent />
 * )
 * 
 * @description
 * This component initializes a map with a vector layer and an OSM tile layer. It adds features to the vector layer based on the `points` array, 
 * each represented by a marker with a custom icon depending on its status. The map view is centered and zoomed to fit the extent of the features.
 * 
 * The component also includes a popup overlay that displays information about a feature when it is clicked. The popup shows the name, status, 
 * and coordinates of the clicked feature.
 * 
 * @returns {JSX.Element} A JSX element containing the map and popup elements.
 * 
 * @hook
 * The component uses the `useEffect` hook to initialize the map and its layers, add features, and set up the popup overlay. The cleanup function 
 * in `useEffect` ensures that the map target is unset when the component is unmounted.
 */

function MapComponent() {
  useEffect(() => {
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    const features = points.map((point) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([point.longitude, point.latitude])),
        name: point.details,
        status: point.status,
      });

      const markerStyle = new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: point.status ? ActiveIcon : InactiveIcon,
        }),
      });

      feature.setStyle(markerStyle);
      return feature;
    });

    vectorSource.addFeatures(features);

    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const extent = vectorSource.getExtent();
    const center = getCenter(extent);

    const map = new Map({
      target: 'map',
      layers: [osmLayer, vectorLayer],
      view: new View({
        center: center.length ? center : fromLonLat([69.240562, 41.311081]),
        zoom: 4,
      }),
    });

    if (features.length > 0) {
      map.getView().fit(extent, {
        size: map.getSize(),
        padding: [80, 50, 50, 50],
        maxZoom: 18,
      });
    }

    const container = document.getElementById('popup');
    const content = document.getElementById('popup-content');
    const closer = document.getElementById('popup-closer');

    if (container) {
      const overlay = new Overlay({
        element: container,
        autoPan: true,
      });

      map.addOverlay(overlay);

      if (closer) {
        closer.onclick = function () {
          overlay.setPosition(undefined);
          closer.blur();
          return false;
        };
      }

      // handle clicks on features
      map.on('singleclick', function (evt) {
        const feature = map.forEachFeatureAtPixel(
          evt.pixel,
          function (feature) {
            return feature;
          }
        );

        if (feature) {
          const geometry = feature.getGeometry();
          if (geometry && geometry instanceof Point) {
            const coordinates = geometry.getCoordinates();
            const name = feature.get('name');
            const status = feature.get('status');

            if (content) {
              content.innerHTML = `<p>${name}</p><p>Status: ${
                status ? 'Active' : 'Inactive'
              }</p><p>You clicked here:</p><code>${toStringHDMS(
                toLonLat(coordinates)
              )}</code>`;
            }
            overlay.setPosition(coordinates);
          }
        } else {
          overlay.setPosition(undefined);
          closer?.blur();
        }
      });
    }

    return () => map.setTarget(undefined);
  }, []);

  return (
    <div>
      <div
        style={{ height: '100vh', width: '100vw' }}
        id='map'
        className='map-container'
      />

      <div id='popup' className='ol-popup' style={{ backgroundColor: '#fff' }}>
        <a href='#' id='popup-closer' className='ol-popup-closer'></a>
        <div id='popup-content'></div>
      </div>
    </div>
  );
}

export default MapComponent;
