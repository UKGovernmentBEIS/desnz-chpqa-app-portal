import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusToColor',
  standalone: true,
})
export class StatusToColorPipe implements PipeTransform {
  transform(value: number): string {
    switch (value) {
      case 0:
        return 'govuk-tag--grey';
      case 1:
        return 'govuk-tag--blue';
      case 2:
        return 'govuk-tag--blue';
      case 3:
        return 'govuk-tag--blue';
      case 4:
        return 'govuk-tag--yellow';
      case 5:
        return 'govuk-tag--yellow';
      case 6:
        return 'govuk-tag--green';
      case 7:
        return 'govuk-tag--light-blue';
      case 8:
        return 'govuk-tag--red';
      case 9:
        return 'govuk-tag--red';

      default:
        return null;
    }
  }
}
