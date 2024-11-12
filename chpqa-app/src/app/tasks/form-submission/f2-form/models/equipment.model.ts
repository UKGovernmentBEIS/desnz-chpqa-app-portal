export interface EquipmentSubType {
  id: string;
  name: string;
  suffix: string;
  equipmentType: string | null;
}

export interface EquipmentType {
  id: string;
  name: string;
  prefix: string;
  equipmentSubTypeList: EquipmentSubType[];
}
