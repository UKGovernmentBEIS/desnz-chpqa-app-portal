import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { OptionItem } from '@shared/models/option-item.model';

@Directive({
  standalone: true,
  selector: '[appOtherOption]'
})
export class OtherOptionDirective implements OnInit {
  @Input() appOtherOption = true;
  @Input() preselectOther = false;
  @Input() disableControl = false;

  private otherOption: OptionItem = { id: 'other', name: 'Other (specify)' };

  constructor(private govukSelectInput: GovukSelectInputComponent) {}

  ngOnInit() {
    if (this.appOtherOption) {
      this.addOtherOption();
      if (this.preselectOther) {
        this.preselectOtherOption();
      }
      if(this.disableControl){
        this.disableDropdown();
      }
    }
  }

  private addOtherOption() {
    if (!this.govukSelectInput.options.find(option => option.id === this.otherOption.id)) {
      this.govukSelectInput.options.push(this.otherOption);
      this.govukSelectInput.onOptionsUpdate();
    }
  }

  private preselectOtherOption() {
    const control = this.govukSelectInput.control;
    if (control) {
      control.setValue(this.otherOption);
      
    }
  }

  private disableDropdown() {
    this.govukSelectInput.control.disable();
  }
}
