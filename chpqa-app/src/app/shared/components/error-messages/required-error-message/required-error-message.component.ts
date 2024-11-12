import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-required-error-messages',
  standalone: true,
  imports: [NgIf],
  templateUrl: './required-error-message.component.html',
  styleUrl: './required-error-message.component.scss',
})
export class RequiredErrorMessageComponent {
  @Input() control: AbstractControl;
  @Input() errorMessage: string;
}
