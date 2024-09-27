import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import 'ol/ol.css';
import useMapStore from '@/store/mapStore';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { MapPoint } from '@/lib/data';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Feature, Overlay } from 'ol';
import { Point } from 'ol/geom';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import ActiveIcon from '/icons/active.svg';
import InactiveIcon from '/icons/inactive.svg';
import { getCenter } from 'ol/extent';
import {
  FullScreen,
  OverviewMap,
  ZoomSlider,
  defaults as defaultControls,
} from 'ol/control';
import {
  DblClickDragZoom,
  defaults as defaultInteractions,
} from 'ol/interaction';
import Popup from './ui/popup';
import { X as CloseIcon } from 'lucide-react';

interface MapComponentProps {
  children?: React.ReactNode;
  zoom: number;
  points?: MapPoint[];
}

export const MapComponent: React.FC<MapComponentProps> = ({
  children,
  zoom,
  points = [],
}) => {
  const setMap = useMapStore((state) => state.populateMap);
  const destroyMap = useMapStore((state) => state.removeMap);
  const setActivePoint = useMapStore((state) => state.setActivePoint);
  const clearActivePoint = useMapStore((state) => state.clearActivePoint);
  const mapId = useRef<HTMLDivElement | null>(null);
  const popupContainer = useRef<HTMLDivElement | null>(null);
  const popupClose = useRef<HTMLAnchorElement | null>(null);
  const overlay = useRef<Overlay | null>(null);
  const mapRef = useRef<Map | null>(null); // Store the map instance

  useEffect(() => {
    const container = popupContainer.current as HTMLDivElement;
    const closer = popupClose.current as HTMLAnchorElement;

    overlay.current = new Overlay({
      element: container,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });

    closer.onclick = function () {
      clearActivePoint();
      overlay.current?.setPosition(undefined);
      closer.blur();
      return false;
    };

    // Create a vector source and layer
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    // Create features from the points
    const features = points.map((point) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([point.longitude, point.latitude])),
        details: point.details,
        status: point.status,
        id: point.id,
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

    //  Add the features to the source
    vectorSource.addFeatures(features);

    // Get the extent of the points
    const extent = vectorSource.getExtent();
    const centerCoords = getCenter(extent);

    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    // Create the map instance
    const map = new Map({
      target: mapId.current as HTMLElement,
      layers: [osmLayer, vectorLayer],
      view: new View({
        center: centerCoords.length
          ? centerCoords
          : fromLonLat([69.240562, 41.311081]),
        zoom,
      }),
      overlays: [overlay.current],
      controls: defaultControls().extend([
        new FullScreen(),
        new OverviewMap(),
        new ZoomSlider(),
      ]),
      interactions: defaultInteractions().extend([new DblClickDragZoom()]),
    });

    mapRef.current = map;

    // center the map on the points
    if (features.length > 0) {
      map.getView().fit(extent, {
        size: map.getSize(),
        padding: [80, 50, 50, 50],
        maxZoom: 18,
      });
    }

    const handleMapClick = (evt: any) => {
      const feature = map.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => feature
      );
      if (feature) {
        const pointValues = feature.getProperties();
        setActivePoint({
          id: pointValues.id,
          details: pointValues.details,
          status: pointValues.status,
          longitude: pointValues.geometry.flatCoordinates[0],
          latitude: pointValues.geometry.flatCoordinates[1],
        });
        const geometry = feature.getGeometry();
        if (geometry && geometry instanceof Point) {
          overlay.current?.setPosition(geometry.getCoordinates());
        }
      } else {
        clearActivePoint();
        overlay.current?.setPosition(undefined);
      }
    };

    map.on('singleclick', handleMapClick);

    setMap(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
      }
      destroyMap();
    };
  }, [points, setMap, destroyMap, zoom, setActivePoint, clearActivePoint]);

  return (
    <>
      <div ref={mapId} id='map' className='h-[100vh] w-full'>
        {children}
      </div>

      <div ref={popupContainer} id='popup' className='ol-popup relative'>
        <Popup />

        <a
          data-cy='popup-close'
          href='#'
          ref={popupClose}
          id='popup-closer'
          className='cursor-pointer absolute top-4 right-4'
        >
          <CloseIcon />
        </a>
      </div>
    </>
  );
};
