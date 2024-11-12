import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { combineLatest, first, Observable } from 'rxjs';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { WEB_COPY_HEAT_REJECTION_FACILITY } from '../../config/heat-rejection-facility.web-copy';
import { Title } from '@angular/platform-browser';
import { HeatRejectionFacilityFacade } from '../../state/heat-rejection-facility.facade';
import { HeatRejectionFacilityService } from '../../services/heat-rejection-facility.service';
import { VALIDATIONS_HEAT_REJECTION_FACILITY } from '../../config/heat-rejection-facility.validations';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { FormStateSyncDirective } from '@shared/directives/form-state-sync.directive';
import { HeatRejectionFacilitySharedStateFormEnum } from '../../config/heat-rejection-facility.config';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';

@Component({
  selector: 'app-heat-rejection-facility',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukSelectInputComponent,
    GovukRadioInputComponent,
    DynamicFormErrorsSummaryComponent,
    FormErrorDirective,
    FormStateSyncDirective,
  ],
  templateUrl: './heat-rejection-facility.component.html',
  providers: [FormGroupDirective, HeatRejectionFacilityFacade, HeatRejectionFacilityService],
})
export class HeatRejectionFacilityComponent {
  webCopy = WEB_COPY_HEAT_REJECTION_FACILITY;
  backButton = `../${FormSubmissionPath.TASK_LIST}`;

  form: FormGroup = this.heatRejectionFacilityService.createHeatRejectionFacilityForm();
  options: RadioButtonOption[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];
  validationMessages = VALIDATIONS_HEAT_REJECTION_FACILITY;
  HeatRejectionFacilitySharedStateFormEnum = HeatRejectionFacilitySharedStateFormEnum;

  formInputs = [
    {
      label: this.webCopy.heatRejectionFacilityLabel,
      controlName: 'heatRejectionFacility',
      validationMessages: this.validationMessages.heatRejectionFacility,
    },
  ];

  selectHeatRejectionFacility$ = this.heatRejectionFacilityFacade.selectHeatRejectionFacility$;
  heatRejectionFacilityFormInputs$ = this.heatRejectionFacilityFacade.heatRejectionFacilityFormInputs$;

  formUpdated = false;

  constructor(
    private heatRejectionFacilityFacade: HeatRejectionFacilityFacade,
    private heatRejectionFacilityService: HeatRejectionFacilityService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.setPageTitle(this.webCopy.caption);
    this.loadHeatRejectionFacility();
  }

  onContinue() {
    if (this.form.valid) {
      this.heatRejectionFacilityFacade.setHeatRejectionFacility();
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }

  private setPageTitle(pageTitle: string): void {
    this.titleService.setTitle(pageTitle);
  }

  private loadHeatRejectionFacility(): void {
    combineLatest([this.selectHeatRejectionFacility$, this.heatRejectionFacilityFormInputs$])
      .pipe(first())
      .subscribe(([heatRejectionFacility, formInputs]) => {
        const selectedOption = this.options.find(
          option => option.value === (formInputs ? formInputs.heatRejectionFacility.value : heatRejectionFacility.heatRejectionFacility.value)
        );

        this.form.patchValue({
          heatRejectionFacility: selectedOption,
        });
      });
  }
}
