import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trueFalse',
  standalone: true,
})
export class TrueFalsePipe implements PipeTransform {
  transform(value: boolean): string {
    switch (value) {
      case true:
        return 'Yes';
      case false:
        return 'No';

      default:
        return null;
    }
  }
}
