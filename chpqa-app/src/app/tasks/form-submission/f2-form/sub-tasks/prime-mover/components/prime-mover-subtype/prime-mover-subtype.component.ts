import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { first } from 'rxjs';
import { EquipmentService } from 'src/app/tasks/form-submission/f2-form/services/equipment.service';
import { selectPrimeMoverSubtype } from '../../store';
import { setPrimeMoverSubtype } from '../../store/prime-mover.actions';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';

@Component({
  selector: 'app-prime-mover-subtype',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukSelectInputComponent,
    DynamicFormErrorsSummaryComponent,
  ],
  templateUrl: './prime-mover-subtype.component.html',
  styleUrl: './prime-mover-subtype.component.scss',
})
export class PrimeMoverSubtypeComponent implements OnInit {
  BACK = `${FormSubmissionPath.BASE_PATH}/${FormSubmissionPath.PRIME_MOVER_ENGINE_TYPE}`;
  form: FormGroup;
  subtypes$ = this.equipmentService.getSubTypes$();

  validationMessages = {
    engineSubtype: {
      required: 'Select a prime mover sub type',
    },
  };

  formUpdated = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private location: Location,
    private readonly equipmentService: EquipmentService
  ) {
    this.form = this.fb.group({
      engineSubtype: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectPrimeMoverSubtype)
      .pipe(first())
      .subscribe(engineSubtype => {
        this.form.patchValue({
          engineSubtype,
        });
      });
  }

  onContinue() {
    if (this.form.valid) {
      const engineSubtype = {
        id: this.form.get('engineSubtype')?.value.id,
        name: this.form.get('engineSubtype')?.value.name,
      };
      this.store.dispatch(setPrimeMoverSubtype({ engineSubtype }));
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
