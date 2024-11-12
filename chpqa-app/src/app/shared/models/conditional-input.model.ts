import { OptionItem } from "./option-item.model";

export interface ConditionalInputConfig {
  type: 'text' | 'number' | 'select' | 'textarea' | 'date';
  controlName: string;
  label: string;
  value: string | number | boolean;
  validationMessages: { [key: string]: string };
  selectOptions?: OptionItem[];
  description?: string;
  maxChars?: number;
  currentDate?: boolean;
}