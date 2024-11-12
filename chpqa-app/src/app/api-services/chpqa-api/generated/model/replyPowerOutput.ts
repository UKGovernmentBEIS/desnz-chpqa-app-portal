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
import { ReplyPowerOutputMeter } from './replyPowerOutputMeter';
import { ReplyEquipmentSubType } from './replyEquipmentSubType';


export interface ReplyPowerOutput { 
    id?: string | null;
    tag?: string | null;
    tagNumber?: string | null;
    tagPrefix?: string | null;
    userTag?: string | null;
    serialNumber?: string | null;
    diagramReferenceNumber?: string | null;
    includeInCalculations?: boolean | null;
    powerType?: number | null;
    meterType?: ReplyEquipmentSubType;
    meter?: ReplyPowerOutputMeter;
    year?: number | null;
    january?: number | null;
    february?: number | null;
    march?: number | null;
    april?: number | null;
    may?: number | null;
    june?: number | null;
    july?: number | null;
    august?: number | null;
    september?: number | null;
    october?: number | null;
    november?: number | null;
    december?: number | null;
    annualTotal?: number | null;
}
