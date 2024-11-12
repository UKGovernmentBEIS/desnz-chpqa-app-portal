import { Directive, Input, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { GovukDateInputComponent } from '@shared/components/form-controls/govuk-date-input/govuk-date-input.component';

@Directive({
  standalone: true,
  selector: '[appCurrentDate]'
})
export class CurrentDateDirective implements OnInit {

  @Input() appCurrentDate = true;

  constructor(private dateInputComponent: GovukDateInputComponent) {}

  ngOnInit() {
    if(this.appCurrentDate){
      const currentDate = new Date();

      this.dateInputComponent.dateForm.setValue({
        day: currentDate.getDate(),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      }); 
      this.dateInputComponent.dateForm.get('day')?.setValidators([Validators.required, Validators.min(1), Validators.max(31)]);
      this.dateInputComponent.dateForm.get('month')?.setValidators([Validators.required, Validators.min(1), Validators.max(12)]);
      this.dateInputComponent.dateForm.get('year')?.setValidators([Validators.required]);
      
      this.dateInputComponent.dateForm.updateValueAndValidity(); 
    }

  }
}
