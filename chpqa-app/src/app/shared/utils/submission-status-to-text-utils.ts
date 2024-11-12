import { SubmissionStatus } from "@shared/enums/status.enum";

export function statusEnumToText(value: number) {
    if (value === null || value === undefined) return '';
    
    const enumValue = SubmissionStatus[value];
    
    if (enumValue) {
      return enumValue.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    return '';
}