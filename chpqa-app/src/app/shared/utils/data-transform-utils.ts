import { FileWithId } from '@shared/models/file-with-id.model';
import { OptionItem } from '@shared/models/option-item.model';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';
import { getMimeType } from '@shared/shared.util';
import { ReplyMeterFile } from 'src/app/api-services/chpqa-api/generated';

export function mapToOptionItem(value: number | string | null | undefined): OptionItem {
  return {
    id: value?.toString() || '',
    name: value?.toString() || '',
  };
}

export function mapToRadioButtonOption(value: string | boolean | number | null | undefined): RadioButtonOption {
  let label: string | null = null;
  if (typeof value === 'boolean') {
    label = value ? 'Yes' : 'No';
  } else if (value !== null && value !== undefined) {
    label = value.toString();
  }
  return {
    label: label,
    value: value !== null && value !== undefined ? value : null,
  };
}

export function mapFiles(files: Array<ReplyMeterFile>): FileWithId[] {
  return files.map(file => {
    const fileId = file.id;
    const fileName = file.name || 'unknown';

    return {
      id: fileId,
      file: new File([fileName], fileName, { type: getMimeType(fileName) })
    };
  });
}