/**
 * WebApi
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export interface RequestEquipment { 
    id?: string | null;
    name: string;
    tagNumber: string;
    yearCommissioned: number;
    equipmentTypeId: string;
    equipmentSubTypeId?: string | null;
    mechanicalLoad: boolean;
    manufacturerId: string;
    modelId: string;
    engineUnitId: string;
    comments?: string | null;
}
