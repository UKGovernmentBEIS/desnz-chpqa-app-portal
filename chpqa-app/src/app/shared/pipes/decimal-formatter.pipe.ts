import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalFormatter',
  standalone: true
})
export class DecimalFormatterPipe implements PipeTransform {

  transform(value: number): number {
    if (value % 1 !== 0) {
      return parseFloat(value.toFixed(2));
    } else {
      return value;
    }
  }

}
