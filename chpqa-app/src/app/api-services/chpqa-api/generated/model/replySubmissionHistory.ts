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
import { ReplyCertificatesFile } from './replyCertificatesFile';


export interface ReplySubmissionHistory { 
    id?: string | null;
    name?: string | null;
    submissionFormType?: number | null;
    year?: string | null;
    assessorResult?: number | null;
    auditDecisionSummary?: string | null;
    certificatesList?: Array<ReplyCertificatesFile> | null;
}
