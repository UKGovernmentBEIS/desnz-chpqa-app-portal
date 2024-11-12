import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiParams, FormDataPayload } from './api.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = `${environment.baseUrl}/api/`;

  constructor(private http: HttpClient) {}

  public fetchData<T>(endpoint: string, params?: ApiParams): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.createHeaders();
    const httpParams = this.createParams(params);
    return this.http.get<T>(url, { headers, params: httpParams }).pipe(
      map(apiResponse => apiResponse),
      catchError(err => {
        const errorMessage =
          err.error?.message || err.message || 'Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  public postData<T, U>(
    endpoint: string,
    body: T,
    params?: ApiParams,
    formDataPayload?: FormDataPayload
  ): Observable<U> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.createHeaders();
    const httpParams = this.createParams(params);
    let postData: any;

    if (formDataPayload) {
      postData = this.createFormData(formDataPayload);
    } else {
      postData = body;
    }

    return this.http.post<U>(url, postData, { headers,  params: httpParams }).pipe(
      map(apiResponse => apiResponse),
      catchError(err => {
        console.log(err);
        
        const errorMessage =
          err.error?.message || err.message || 'Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  private createHeaders(): HttpHeaders {
    return new HttpHeaders();
  }

  private createParams(params?: ApiParams): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return httpParams;
  }

  private createFormData(formDataPayload: FormDataPayload): FormData {
    let formData = new FormData();
    if (formDataPayload) {
      Object.keys(formDataPayload).forEach(key => {
        if (formDataPayload[key] !== null && formDataPayload[key] !== undefined) {
          formData.append(key, formDataPayload[key]);
        }
      });
    }
    return formData;
  }

}
