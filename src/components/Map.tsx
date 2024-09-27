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
} from 'ol/control.js';
import {
  DblClickDragZoom,
  defaults as defaultInteractions,
} from 'ol/interaction.js';
import Popup from './ui/popup';

interface MapComponentProps {
  children?: React.ReactNode;
  zoom: number;
  points?: MapPoint[];
}

/**
 * MapComponent renders an interactive map using OpenLayers.
 *
 * Props:
 * - `children`: Optional child components to render.
 * - `zoom`: Initial zoom level of the map.
 * - `points`: Array of MapPoint objects to display on the map.
 */
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

  useEffect(() => {
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

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

    vectorSource.addFeatures(features);

    const extent = vectorSource.getExtent();
    const centerCoords = getCenter(extent);

    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    if (!overlay.current) {
      overlay.current = new Overlay({
        element: popupContainer.current as HTMLElement,
        autoPan: {
          animation: {
            duration: 250,
          },
        },
      });

      const closer = popupClose.current;
      if (closer) {
        closer.onclick = function () {
          clearActivePoint();
          overlay.current?.setPosition(undefined);
          closer.blur();
          return false;
        };
      } else {
        console.error('No popup closer found');
      }
    }

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
        // @ts-ignore
        const pointValues = feature.values_;
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
      if (!map) return;
      map.setTarget(undefined);
      destroyMap();
    };
  }, [points, setMap, destroyMap, zoom, setActivePoint, clearActivePoint]);

  return (
    <>
      <div ref={mapId} id='map' className='h-[100vh] w-full'>
        {children}
      </div>

      <div ref={popupContainer} id='popup' className='ol-popup'>
        <a
          ref={popupClose}
          href='#'
          id='popup-closer'
          className='ol-popup-closer'
        ></a>
        <Popup />
      </div>
    </>
  );
};
