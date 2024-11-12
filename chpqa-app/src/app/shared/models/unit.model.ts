import { OptionItem } from "./option-item.model";

export interface Manufacturer {
  id: string;
  name: string;
  statecode: string | null;
}

export interface Model {
  id: string;
  name: string;
  manufacturer: Manufacturer | null;
}

export interface Engine {
  id: string;
  name: string;
  model: Model | null;
}

export interface Type {
  id: string;
  name: string;
  model: Model | null;
}

export interface Unit {
  id: string;
  name: string;
  manufacturer: Manufacturer;
  model: Model;
  engine: Engine;
  totalPowerCapacityKw: number;
  totalHeatCapacityKw: number;
  fuelInputKw: number;
  powerEfficiency: number;
  maxHeatToPowerRatio: number;
  maxHeatEfficiency: number;
  maxOverallEfficiency: number;
}
