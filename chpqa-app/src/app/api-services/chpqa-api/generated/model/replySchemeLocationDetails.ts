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
import { ReplySiteLocationContact } from './replySiteLocationContact';


export interface ReplySchemeLocationDetails { 
    id?: string | null;
    name?: string | null;
    address1?: string | null;
    address2?: string | null;
    postcode?: string | null;
    town?: string | null;
    county?: string | null;
    instructions?: string | null;
    areYouTheSiteContactPerson?: boolean | null;
    contactPerson?: ReplySiteLocationContact;
}
