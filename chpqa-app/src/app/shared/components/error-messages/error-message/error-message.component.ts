import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { getValidatorErrorMessage } from '@shared/utils/validators-utils';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [NgIf],
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss'],
})
export class ErrorMessageComponent {
  @Input() control!: AbstractControl;
  @Input() validationMessages: { [key: string]: string };

  get errorMessage() {
    for (const validatorName in this.control?.errors) {
      if (this.control.touched) {
        return this.validationMessages[validatorName] || getValidatorErrorMessage(
          validatorName,
          this.control.errors[validatorName]
        );
      }
    }
    return null;
  }
}
