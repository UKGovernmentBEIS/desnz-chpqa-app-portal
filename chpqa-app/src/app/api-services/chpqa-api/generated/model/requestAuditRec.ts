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


export interface RequestAuditRec { 
    submissionId: string;
    auditRecId?: string | null;
    isRecommended: boolean;
    technicalPerformanceConcerns?: boolean | null;
    complianceConcerns?: boolean | null;
    comments?: string | null;
}

