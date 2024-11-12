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
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent, HttpParameterCodec, HttpContext 
        }       from '@angular/common/http';
import { CustomHttpParameterCodec }                          from '../encoder';
import { Observable }                                        from 'rxjs';

// @ts-ignore
import { RequestReturnId } from '../model/requestReturnId';

// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';



@Injectable({
  providedIn: 'root'
})
export class UploadFilesService {

    protected basePath = 'http://localhost';
    public defaultHeaders = new HttpHeaders();
    public configuration = new Configuration();
    public encoder: HttpParameterCodec;

    constructor(protected httpClient: HttpClient, @Optional()@Inject(BASE_PATH) basePath: string|string[], @Optional() configuration: Configuration) {
        if (configuration) {
            this.configuration = configuration;
        }
        if (typeof this.configuration.basePath !== 'string') {
            const firstBasePath = Array.isArray(basePath) ? basePath[0] : undefined;
            if (firstBasePath != undefined) {
                basePath = firstBasePath;
            }

            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
    }

    /**
     * @param consumes string[] mime-types
     * @return true: consumes contains 'multipart/form-data', false: otherwise
     */
    private canConsumeForm(consumes: string[]): boolean {
        const form = 'multipart/form-data';
        for (const consume of consumes) {
            if (form === consume) {
                return true;
            }
        }
        return false;
    }

    // @ts-ignore
    private addToHttpParams(httpParams: HttpParams, value: any, key?: string): HttpParams {
        if (typeof value === "object" && value instanceof Date === false) {
            httpParams = this.addToHttpParamsRecursive(httpParams, value);
        } else {
            httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return httpParams;
    }

    private addToHttpParamsRecursive(httpParams: HttpParams, value?: any, key?: string): HttpParams {
        if (value == null) {
            return httpParams;
        }

        if (typeof value === "object") {
            if (Array.isArray(value)) {
                (value as any[]).forEach( elem => httpParams = this.addToHttpParamsRecursive(httpParams, elem, key));
            } else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(key, (value as Date).toISOString().substring(0, 10));
                } else {
                   throw Error("key may not be null if value is Date");
                }
            } else {
                Object.keys(value).forEach( k => httpParams = this.addToHttpParamsRecursive(
                    httpParams, value[k], key != null ? `${key}.${k}` : k));
            }
        } else if (key != null) {
            httpParams = httpParams.append(key, value);
        } else {
            throw Error("key may not be null if value is not object or array");
        }
        return httpParams;
    }

    /**
     * @param idSubmission 
     * @param entity 
     * @param attributeName 
     * @param parentEntity 
     * @param parentAttributeName 
     * @param fileName 
     * @param diagramType 
     * @param mimeType 
     * @param entityId 
     * @param comments 
     * @param file 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public apiSecureUploadFilesPost(idSubmission: string, entity?: string, attributeName?: string, parentEntity?: string, parentAttributeName?: string, fileName?: string, diagramType?: number, mimeType?: string, entityId?: string, comments?: string, file?: Blob, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext, transferCache?: boolean}): Observable<RequestReturnId>;
    public apiSecureUploadFilesPost(idSubmission: string, entity?: string, attributeName?: string, parentEntity?: string, parentAttributeName?: string, fileName?: string, diagramType?: number, mimeType?: string, entityId?: string, comments?: string, file?: Blob, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext, transferCache?: boolean}): Observable<HttpResponse<RequestReturnId>>;
    public apiSecureUploadFilesPost(idSubmission: string, entity?: string, attributeName?: string, parentEntity?: string, parentAttributeName?: string, fileName?: string, diagramType?: number, mimeType?: string, entityId?: string, comments?: string, file?: Blob, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext, transferCache?: boolean}): Observable<HttpEvent<RequestReturnId>>;
    public apiSecureUploadFilesPost(idSubmission: string, entity?: string, attributeName?: string, parentEntity?: string, parentAttributeName?: string, fileName?: string, diagramType?: number, mimeType?: string, entityId?: string, comments?: string, file?: Blob, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext, transferCache?: boolean}): Observable<any> {
        if (idSubmission === null || idSubmission === undefined) {
            throw new Error('Required parameter idSubmission was null or undefined when calling apiSecureUploadFilesPost.');
        }

        let localVarQueryParameters = new HttpParams({encoder: this.encoder});
        if (idSubmission !== undefined && idSubmission !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>idSubmission, 'idSubmission');
        }
        if (entity !== undefined && entity !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>entity, 'entity');
        }
        if (attributeName !== undefined && attributeName !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>attributeName, 'attributeName');
        }
        if (parentEntity !== undefined && parentEntity !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>parentEntity, 'parentEntity');
        }
        if (parentAttributeName !== undefined && parentAttributeName !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>parentAttributeName, 'parentAttributeName');
        }
        if (fileName !== undefined && fileName !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>fileName, 'fileName');
        }
        if (diagramType !== undefined && diagramType !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>diagramType, 'diagramType');
        }
        if (mimeType !== undefined && mimeType !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>mimeType, 'mimeType');
        }
        if (entityId !== undefined && entityId !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>entityId, 'entityId');
        }
        if (comments !== undefined && comments !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>comments, 'comments');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (Bearer) required
        localVarCredential = this.configuration.lookupCredential('Bearer');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'text/plain',
                'application/json',
                'text/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }

        let localVarTransferCache: boolean | undefined = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'multipart/form-data'
        ];

        const canConsumeForm = this.canConsumeForm(consumes);

        let localVarFormParams: { append(param: string, value: any): any; };
        let localVarUseForm = false;
        let localVarConvertFormParamsToString = false;
        // use FormData to transmit files using content-type "multipart/form-data"
        // see https://stackoverflow.com/questions/4007969/application-x-www-form-urlencoded-or-multipart-form-data
        localVarUseForm = canConsumeForm;
        if (localVarUseForm) {
            localVarFormParams = new FormData();
        } else {
            localVarFormParams = new HttpParams({encoder: this.encoder});
        }

        if (file !== undefined) {
            localVarFormParams = localVarFormParams.append('file', <any>file) as any || localVarFormParams;
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/secure/UploadFiles`;
        return this.httpClient.request<RequestReturnId>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: localVarConvertFormParamsToString ? localVarFormParams.toString() : localVarFormParams,
                params: localVarQueryParameters,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                transferCache: localVarTransferCache,
                reportProgress: reportProgress
            }
        );
    }

}