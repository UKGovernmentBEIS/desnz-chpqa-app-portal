import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectPrimeMoverMechanicalLoad } from '../../store';
import { setPrimeMoverMechanicalLoad } from '../../store/prime-mover.actions';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { first } from 'rxjs';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';

@Component({
  selector: 'app-prime-mover-mechanical-load',
  standalone: true,
  templateUrl: './prime-mover-mechanical-load.component.html',
  styleUrl: './prime-mover-mechanical-load.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukRadioInputComponent,
    DynamicFormErrorsSummaryComponent,
  ],
})
export class PrimeMoverMechanicalLoadComponent {
  BACK = `${FormSubmissionPath.BASE_PATH}/${FormSubmissionPath.ADD_PRIME_MOVER}`;
  form: FormGroup;
  mechanicalLoadOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  validationMessages = {
    mechanicalLoad: {
      required:
        'Select yes if the reciprocating engine drives a mechanical load',
    },
  };

  formUpdated = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private location: Location
  ) {
    this.form = this.fb.group({
      mechanicalLoad: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectPrimeMoverMechanicalLoad)
      .pipe(first())
      .subscribe(mechanicalLoad => {
        const selectedOption = this.mechanicalLoadOptions.find(
          option => option.value === mechanicalLoad?.value
        );
        this.form.patchValue({
          mechanicalLoad: selectedOption,
        });
      });
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(setPrimeMoverMechanicalLoad(this.form.getRawValue()));
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }

  goBack(): void {
    this.location.back();
  }
}
