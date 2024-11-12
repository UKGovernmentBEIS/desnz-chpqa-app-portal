import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FileTypes } from '@shared/enums/file-type.enum';
import { extensionToMimeMap } from '@shared/shared.util';

export const getValidatorErrorMessage = (validatorName: string, validatorErrors?: ValidationErrors): string | undefined => {
  let args = messages.get(validatorName)?.validatorErrorsKey?.map(name => validatorErrors?.[name]);
  return args ? stringFormat(messages.get(validatorName)?.message, ...args) : messages.get(validatorName)?.message;
};

const messages = new Map<string, { message: string; validatorErrorsKey?: string[] }>([
  ['required', { message: 'This field is required' }],
  ['email', { message: 'Enter a valid email' }],
  [
    'minlength',
    {
      message: 'Field must be at least {0} characters long',
      validatorErrorsKey: ['requiredLength'],
    },
  ],
  [
    'maxlength',
    {
      message: 'Field cannot be more than {0} characters long',
      validatorErrorsKey: ['requiredLength'],
    },
  ],
]);

function stringFormat(template: string | undefined, ...args: any[]) {
  if (template) {
    return template.replace(/{(\d+)}/g, (match, index) => {
      return typeof args[index] !== 'undefined' ? args[index] : match;
    });
  }
  return undefined;
}

export const rangeValidator = (minControlName: string, maxControlName: string): ValidatorFn => {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const min = control.get(minControlName);
    const max = control.get(maxControlName);
    if (min && max && min.value >= max.value) {
      if (!min.errors && !max.errors) {
        max.setErrors({ rangeError: true });
      }
      return null;
    }
    return null;
  };
};

export const positiveValueValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value !== null && value !== undefined) {
      if (value < 0) {
        return { nonPositive: true };
      }
    }
    return null;
  };
};

export const percentageValueValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value != null) {
      if (value < 0 || value > 100) {
        const errors = { percentageError: true };
        control.setErrors(errors);
        return errors;
      }
    }
    return null;
  };
};

const ALL_FILE_TYPES = [
  FileTypes.doc,
  FileTypes.docx,
  FileTypes.xls,
  FileTypes.xlsx,
  FileTypes.ppt,
  FileTypes.pptx,
  FileTypes.vsd,
  FileTypes.vsdx,
  FileTypes.jpeg,
  FileTypes.jpg,
  FileTypes.png,
  FileTypes.tiff,
  FileTypes.pdf,
  FileTypes.txt,
];

export const fileTypeValidator = (validateAgainstFileTypes?: FileTypes[]): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const controlValue = control.value;
    let files: File[];
    if (controlValue && !Array.isArray(controlValue)) {
      files = [controlValue];
    } else {
      files = control.value as File[];
    }

    if (files && files.length > 0) {
      for (let file of files) {
        const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase() as FileTypes;
        const fileMimeType = file.type;
        const acceptedMimeType = extensionToMimeMap[fileExtension];

        let allowedFileTypes = validateAgainstFileTypes ? validateAgainstFileTypes : ALL_FILE_TYPES;

        if (acceptedMimeType && allowedFileTypes.includes(fileExtension)) {
          if (fileMimeType !== acceptedMimeType) {
            return { invalidFileType: true };
          }
        } else {
          return { invalidFileType: true };
        }
      }
    }
    return null;
  };
};

export function fileSizeValidator(maxSizeMB: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const files = control.value as File[];
    if (files && files.length > 0) {
      for (let file of files) {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
          return { exceedsFileSize: true };
        }
      }
    }
    return null;
  };
}

export function maxFilesValidator(maxFiles: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const files = control.value as File[];
    if (files && files.length > maxFiles) {
      return { maxFiles: true };
    }
    return null;
  };
}

export function passwordContainsEmail(emailAddress: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;
    if (emailAddress && password.includes(emailAddress.split('@')[0])) {
      return { containsEmail: true };
    }
    return null;
  }
}

export function passwordComplexity(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasNonAlphanumeric = /[~!@#$%^&*_\-+=`|\\(){}[\]:;"'<>,.?/]/.test(password);

    const categories = [hasUpperCase, hasLowerCase, hasDigit, hasNonAlphanumeric];
    const validCategories = categories.filter(Boolean).length;

    if (validCategories < 3) {
      return {
        hasUpperCase,
        hasLowerCase,
        hasDigit,
        hasNonAlphanumeric
      }
    }

    return null; // Passes all checks
  };
}

export const FILE_VALIDATION_MESSAGES = {
  files: {
    required: 'Upload at least one file',
    maxFiles: 'You can upload up to 25 files',
    invalidFileType: 'The selected file must be an MS Office, image, PDF or plain text file',
    exceedsFileSize: 'The selected file size can only be up to 50MB',
  },
};
