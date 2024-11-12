import { ChangeLinkAriaLabel } from "@shared/enums/aria-label.enum";
import { FileWithId } from "./file-with-id.model";

export interface ReviewFieldConfig {
  name: string;
  label: string;
  type: string;
  changeLink: string;
  showChangeLink: boolean;
  value: FileWithId[] | string;
  ariaLabel: ChangeLinkAriaLabel;
}
