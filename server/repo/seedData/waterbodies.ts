import { WaterbodyRecord } from '../../../shared/types';

export const WATERBODIES: WaterbodyRecord[] = [
  {
    id: 'WB-KA-BLR-01',
    name: 'Ulsoor Lake & Ecological Wetland Buffer',
    type: 'Lake',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    bufferDistanceMeters: 65,
    boundaryGeojson: {
      type: 'Polygon',
      coordinates: [[
        [77.6180, 12.9800],
        [77.6200, 12.9800],
        [77.6200, 12.9830],
        [77.6180, 12.9830],
        [77.6180, 12.9800]
      ]]
    }
  },
  {
    id: 'WB-TS-HYD-02',
    name: 'Durgam Cheruvu Protected Water Catchment',
    type: 'Lake',
    district: 'Hyderabad',
    state: 'Telangana',
    bufferDistanceMeters: 65,
    boundaryGeojson: {
      type: 'Polygon',
      coordinates: [[
        [78.3830, 17.4330],
        [78.3846, 17.4330],
        [78.3846, 17.4365],
        [78.3830, 17.4365],
        [78.3830, 17.4330]
      ]]
    }
  },
  {
    id: 'WB-GJ-AHM-03',
    name: 'Vastrapur Lake Ecological Buffer',
    type: 'Lake',
    district: 'Ahmedabad',
    state: 'Gujarat',
    bufferDistanceMeters: 65,
    boundaryGeojson: {
      type: 'Polygon',
      coordinates: [[
        [72.5260, 23.0340],
        [72.5278, 23.0340],
        [72.5278, 23.0375],
        [72.5260, 23.0375],
        [72.5260, 23.0340]
      ]]
    }
  }
];
