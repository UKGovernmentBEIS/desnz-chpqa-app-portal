export type ApiResponse<T> = SuccessApiResponse<T> | ErrorApiResponse;

export interface ErrorApiResponse {}

export interface SuccessApiResponse<T> {}

export interface ApiParams {
  [key: string]: string | number | boolean;
}

export interface FormDataPayload {
  [key: string]: string | File;
}
