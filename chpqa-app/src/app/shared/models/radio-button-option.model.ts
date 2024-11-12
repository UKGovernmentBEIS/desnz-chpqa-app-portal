import { ConditionalInputConfig } from "./conditional-input.model";

export interface RadioButtonOption {
    label: string;
    value: string | boolean | number;
    inputConfig?: ConditionalInputConfig;
    hint?: string;
    disable?: boolean
}