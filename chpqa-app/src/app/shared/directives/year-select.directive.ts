import { Directive, Input } from '@angular/core';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { OptionItem } from '@shared/models/option-item.model';

@Directive({
  standalone: true,
  selector: '[appYearSelect]'
})
export class YearSelectDirective {

  @Input() startYear = 1990;
  @Input() endYear = new Date().getFullYear();

  constructor(private govukSelectInput: GovukSelectInputComponent) {}

  ngOnInit() {
    const options = this.generateYearOptions(this.startYear, this.endYear);
    this.govukSelectInput.options = options;
    this.govukSelectInput.onOptionsUpdate();
  }

  private generateYearOptions(start: number, end: number): OptionItem[] {
    const options: OptionItem[] = [];
    for (let year = start; year <= end; year++) {
      options.push({ id: year.toString(), name: year.toString() });
    }
    return options;
  }


}
