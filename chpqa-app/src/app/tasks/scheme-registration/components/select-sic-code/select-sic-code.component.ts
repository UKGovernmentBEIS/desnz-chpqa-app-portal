import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';
import { SicCode } from 'src/app/api-services/chpqa-api/generated';
import { Store } from '@ngrx/store';
import { selectSicCode, setSicCode } from '../../store';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { selectUser } from 'src/app/auth/auth.selector';
import { CompanyHouseService } from '@shared/services';
import { AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SchemeRegistartiondPath } from '../../models/scheme-registration-path.model';
import { schemeRegistrationCopy } from '../../config/scheme-registration-copy-config';

@Component({
  selector: 'app-select-sic-code',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    RouterModule,
    FormErrorDirective,
    GovukRadioInputComponent
  ],
  templateUrl: './select-sic-code.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSicCodeComponent {
  BACK = `../${SchemeRegistartiondPath.ENTER_SCHEME_NAME}`;
  
  readonly controlName = 'sicCode';

  copy = schemeRegistrationCopy;

  private readonly registrationNumber$ = this.store.select(selectUser).pipe(
    map(user => user.organisation?.registrationNumber)
  );
  private readonly companySicCodes$ = this.registrationNumber$.pipe(
    switchMap(registrationNumber => {
      return registrationNumber
        ? this.companyHouseService.fetchInfoWithSicDescription(registrationNumber)
        : of(null);
    }),
    map(companyHouseInfo => companyHouseInfo?.sic_codes)
  );
  private readonly preselectedSicCode$ = this.store.select(selectSicCode);
  sicCodesOptions: RadioButtonOption[] = [];

  form$ = combineLatest([this.companySicCodes$, this.preselectedSicCode$]).pipe(
    map(([companySicCodes, preselectedSicCode]) => {
      this.sicCodesOptions = this.buildSicCodesOptions(companySicCodes);
      const preselectedValue = this.getPreselectedFormValue(preselectedSicCode);

      return {
        companySicCodes,
        form: this.fb.group({
          sicCode: [preselectedValue, [Validators.required]],
        })
      };
    })
  );

  constructor(
    private companyHouseService: CompanyHouseService,
    private fb: FormBuilder,
    private store: Store
  ) {}

  onContinue(form: FormGroup, companySicCodes: SicCode[]) {
    if (form.valid) {
      const selectedSicCodeId = form.value[this.controlName].value;
      const sicCode = companySicCodes.find(
        sicCode => sicCode.id === selectedSicCodeId
      );
      this.store.dispatch(setSicCode({ sicCode }));
    }
  }

  private buildSicCodesOptions(sicCodes: SicCode[]) {
    return sicCodes.map(sicCode => ({
      label: `<span>${sicCode.name}</span> <span class="govuk-!-margin-left-9">${sicCode.description}</span>`,
      value: sicCode.id,
    }));
  }

  private getPreselectedFormValue(preselectedSicCode: SicCode) {
    let preselectedValue: RadioButtonOption;

    if (preselectedSicCode) {
      preselectedValue = this.sicCodesOptions.find(
        sicCodeOption => sicCodeOption.value === preselectedSicCode.id
      );
    } else {
      preselectedValue = this.sicCodesOptions.length === 1
        ? this.sicCodesOptions[0]
        : null;
    }

    return preselectedValue;
  }
}
