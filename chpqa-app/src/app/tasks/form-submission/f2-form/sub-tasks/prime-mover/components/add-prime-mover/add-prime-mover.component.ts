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
import { YearSelectDirective } from '@shared/directives/year-select.directive';
import { combineLatest, first } from 'rxjs';
import {
  selectPrimeMoverTagNumber,
  selectPrimeMoverYearCommissioned,
} from '../../store/prime-mover.selectors';
import { setPrimeMoverDetails } from '../../store/prime-mover.actions';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { GovukNumberFormControlComponent } from '@shared/components/form-controls/govuk-number-input/gov-uk-number-form-control.component';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { GovukTextInputComponent } from "../../../../../../../shared/components/form-controls/govuk-text-input/govuk-text-input.component";

@Component({
  selector: 'app-add-prime-mover',
  standalone: true,
  templateUrl: './add-prime-mover.component.html',
  styleUrl: './add-prime-mover.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukSelectInputComponent,
    YearSelectDirective,
    DynamicFormErrorsSummaryComponent,
    GovukTextInputComponent
],
})
export class AddPrimeMoverComponent implements OnInit {
  BACK = '../' + `${FormSubmissionPath.TASK_LIST}`;
  form: FormGroup;

  validationMessages = {
    tagNumber: {
      required: 'Enter a tag number',
    },
    yearCommissioned: {
      required: 'Select a year',
    },
  };

  formUpdated = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private location: Location
  ) {
    this.form = this.fb.group({
      tagNumber: [null, [Validators.required]],
      yearCommissioned: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    combineLatest([
      this.store.select(selectPrimeMoverTagNumber),
      this.store.select(selectPrimeMoverYearCommissioned),
    ])
      .pipe(first())
      .subscribe(([tagNumber, yearCommissioned]) => {
        this.form.patchValue({
          tagNumber,
          yearCommissioned,
        });
      });
  }

  onContinue() {
    if (this.form.valid) {
      const payload = {
        tagNumber: this.form.get('tagNumber')?.value,
        yearCommissioned: this.form.get('yearCommissioned')?.value,
      };
      this.store.dispatch(setPrimeMoverDetails(payload));
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
