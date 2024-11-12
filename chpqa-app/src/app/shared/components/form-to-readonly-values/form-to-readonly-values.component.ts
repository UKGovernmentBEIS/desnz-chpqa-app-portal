import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-to-readonly-values',
  standalone: true,
  templateUrl: './form-to-readonly-values.component.html',
  imports: [CommonModule]
})
export class FormToReadonlyValuesComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) fieldOrder!: string[];
  @Input({ required: true }) fieldData!: { [key: string]: { label: string; hint: string, metricUnit: string } };

  getLabel(controlName: string): string {
    return this.fieldData[controlName]?.label || controlName;
  }

  getHint(controlName: string): string {
    return this.fieldData[controlName]?.hint || '';
  }

  getMetricUnit(controlName: string): string {
    return this.fieldData[controlName]?.metricUnit || '';
  }
}
