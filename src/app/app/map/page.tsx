import { getMapPOIs, getFloorPlans, getFloorPlanWithZones } from '@/modules/map/actions';
import OutdoorMap from '@/components/map/OutdoorMap';
import IndoorMap from '@/components/map/IndoorMap';
import MapTabs from '@/components/map/MapTabs';
import type { FloorPlan, IndoorZone } from '@/modules/map/types';

export default async function MapPage() {
  const [poisResult, floorPlansResult] = await Promise.all([
    getMapPOIs(),
    getFloorPlans(),
  ]);

  const pois = poisResult.data ?? [];
  const floorPlans = floorPlansResult.data ?? [];

  let firstFloorPlan: FloorPlan | null = null;
  let firstFloorZones: IndoorZone[] = [];

  if (floorPlans.length > 0) {
    const fpResult = await getFloorPlanWithZones(floorPlans[0].id);
    firstFloorPlan = fpResult.floorPlan;
    firstFloorZones = fpResult.zones ?? [];
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🗺️ Газрын зураг</h1>
      <MapTabs
        outdoorContent={<OutdoorMap pois={pois} />}
        indoorContent={
          firstFloorPlan ? (
            <IndoorMap floorPlan={firstFloorPlan} zones={firstFloorZones} />
          ) : (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-2">🏗️</div>
              <div>Дотоод зураг удахгүй нэмэгдэнэ</div>
            </div>
          )
        }
      />
    </div>
  );
}
