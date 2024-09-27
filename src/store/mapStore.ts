import { saveToLocalStorage } from '@/lib/utils';
import { create } from 'zustand';

interface MapPoint {
  id: string; 
  details: string; 
  status: boolean; 
  longitude: number; 
  latitude: number; 
}

interface MapStoreState {
  map: any | null; 
  points: MapPoint[]; 
  setPoints: (points: MapPoint[]) => void; 
  populateMap: (mapGenerated: any) => void; 
  removeMap: () => void; 
  updatePoint: (updatedPoint: Partial<MapPoint>) => void; 
  activePoint: MapPoint | null; 
  setActivePoint: (point: MapPoint) => void; 
  clearActivePoint: () => void; 
}

/**
 * A Zustand store for managing the state of the map and its points.
 * 
 * - `map`: The current map instance.
 * - `points`: An array of all points on the map.
 * - `setPoints`: Function to update the points array.
 * - `populateMap`: Function to set the map instance.
 * - `removeMap`: Function to clear the map instance.
 * - `updatePoint`: Function to update a specific point.
 * - `activePoint`: The currently active point.
 * - `setActivePoint`: Function to set the active point.
 * - `clearActivePoint`: Function to clear the active point.
 */

const useMapStore = create<MapStoreState>((set) => ({
  map: null,
  activePoint: null,
  points: [],
  setPoints: (points) => set({ points }),
  populateMap: (mapGenerated) => set({ map: mapGenerated }),
  removeMap: () => set({ map: null }),
  setActivePoint: (point) => set({ activePoint: point }),
  clearActivePoint: () => set({ activePoint: null }),
  updatePoint: (updatedPoint: Partial<MapPoint>) => {
    set((state) => {
      const updatedPoints = state.points.map((point) =>
        point.id === updatedPoint.id ? { ...point, ...updatedPoint } : point
      );

      const updatedActivePoint =
        state.activePoint && state.activePoint.id === updatedPoint.id
          ? { ...state.activePoint, ...updatedPoint }
          : state.activePoint;

      saveToLocalStorage('points', updatedPoints);
      return { points: updatedPoints, activePoint: updatedActivePoint };
    });
  },
}));

export default useMapStore;
