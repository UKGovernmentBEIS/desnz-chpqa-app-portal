import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { Store } from '@ngrx/store';
import { EquipmentService } from 'src/app/tasks/form-submission/f2-form/services/equipment.service';
import { selectPrimeMoverType } from '../../store';
import { setPrimeMoverType } from '../../store/prime-mover.actions';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { first, switchMap } from 'rxjs';
import { selectFormSubmissionType } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { RouterLink } from '@angular/router';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';

@Component({
  selector: 'app-prime-mover-select-type',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    GovukSelectInputComponent,
    DynamicFormErrorsSummaryComponent,
  ],
  templateUrl: './prime-mover-type.component.html',
  styleUrl: './prime-mover-type.component.scss',
})
export class PrimeMoverTypeComponent implements OnInit {
  BACK = `../${FormSubmissionPath.ADD_PRIME_MOVER}`;
  form: FormGroup;

  validationMessages = {
    engineType: {
      required: 'Select a prime mover type',
    },
  };

  formUpdated = false;

  types$ = this.store
    .select(selectFormSubmissionType)
    .pipe(
      switchMap(submissionFormType =>
        this.equipmentService.getTypesFor(submissionFormType)
      )
    );

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly equipmentService: EquipmentService
  ) {
    this.form = this.fb.group({
      engineType: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectPrimeMoverType)
      .pipe(first())
      .subscribe(engineType => {
        this.form.patchValue({
          engineType,
        });
      });
  }

  onContinue() {
    if (this.form.valid) {
      const engineType = {
        id: this.form.get('engineType')?.value.id,
        name: this.form.get('engineType')?.value.name,
      };
      this.store.dispatch(setPrimeMoverType({ engineType }));
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
