import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { FileTypes } from "./enums/file-type.enum";

export function getFormValidationErrors(form: FormGroup) {
  const errorMap: any = {};
  Object.keys(form.controls).forEach(key => {
    const controlErrors: ValidationErrors = form.get(key).errors;
    if (controlErrors != null) {

      Object.keys(controlErrors).forEach(keyError => {
        errorMap[key] = keyError;
      });
    }
  });
  return errorMap;
}

export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const passwordConfirmation = control.get('passwordConfirmation');

  if (password && passwordConfirmation && password.value !== passwordConfirmation.value) {
    return { passwordMismatch: true };
  }

  return null;
};


export const extensionToMimeMap: { [key: string]: string } = {
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.vsd': 'application/vnd.visio',
  '.vsdx': 'application/vnd.visio',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.tiff': 'image/tiff',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
};

export const downloadFile = (fileData: any, fileName: string) => {
  const blob = new Blob([fileData], { type: getMimeType(fileName) });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export const getMimeType = (fileName: string): string => {
  const extension = `.${fileName.split('.').pop()?.toLowerCase()}`;
  const fileType = Object.values(FileTypes).find(ext => ext === extension) as FileTypes;
  return fileType ? extensionToMimeMap[fileType] : 'unknown';
};