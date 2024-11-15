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


export interface RequestAdditEquip { 
    name: string;
    manufacturer: string;
    model: string;
    numberInstalled: number;
    usageFrequency: number;
    estimatedEnergyConsumptionKwe?: number | null;
    estimatedEnergyConsumptionKwth?: number | null;
    comments?: string | null;
}

