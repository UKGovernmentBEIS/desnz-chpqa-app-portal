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
import { ReplyOrganisation } from './replyOrganisation';


export interface ReplyPerson { 
    id?: string | null;
    username?: string | null;
    password?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    jobTitle?: string | null;
    userType?: number | null;
    consultant?: boolean | null;
    telephone1?: string | null;
    telephone2?: string | null;
    organisation?: ReplyOrganisation;
}
