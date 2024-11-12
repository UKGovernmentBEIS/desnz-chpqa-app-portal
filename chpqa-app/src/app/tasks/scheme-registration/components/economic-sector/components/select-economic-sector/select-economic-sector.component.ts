import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { OptionItem } from '@shared/models/option-item.model';
import { EconomicSector } from 'src/app/api-services/chpqa-api/generated';
import { RouterModule } from '@angular/router';
import { SchemeRegistartiondPath } from 'src/app/tasks/scheme-registration/models/scheme-registration-path.model';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';
import { selectEconomicSector, setEconomicSector } from 'src/app/tasks/scheme-registration/store';
import { EconomicSectorService } from '../../services/economic-sector.service';
import { AsyncPipe } from '@angular/common';
import { schemeRegistrationCopy } from 'src/app/tasks/scheme-registration/config/scheme-registration-copy-config';

@Component({
  selector: 'app-select-economic-sector',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    RouterModule,
    FormErrorDirective,
    GovukSelectInputComponent
  ],
  templateUrl: './select-economic-sector.component.html'
})
export class SelectEconomicSectorComponent {
  BACK = `../${SchemeRegistartiondPath.ENTER_SCHEME_NAME}`;
  availableEconomicSectors: OptionItem[] = [];

  copy = schemeRegistrationCopy;

  private readonly preselectedEconSec$ = this.store.select(selectEconomicSector);
  private readonly economicSectors$ = this.economicSectorService.fetchAll();
  
  form$ = combineLatest([this.economicSectors$, this.preselectedEconSec$]).pipe(
    map(([economicSectors, preselectedEconSec]) => {
      this.availableEconomicSectors = this.buildEconomicSectorOptions(economicSectors);
      const preselectedValue = this.getPreselectedFormValue(preselectedEconSec);

      return this.fb.group({
        econSector: [preselectedValue, [Validators.required]],
      });
    })
  );

  constructor(
    private economicSectorService: EconomicSectorService,
    private fb: FormBuilder,
    private store: Store
  ) {}

  onContinue(form: FormGroup) {
    if (form.valid) {
      this.store.dispatch(setEconomicSector(form.getRawValue()));
    }
  }

  private buildEconomicSectorOptions(economicSectors: EconomicSector[]) {
    return economicSectors.map(economicSector => ({
      id: economicSector.id,
      name: economicSector.name,
    }));
  }

  private getPreselectedFormValue(preselectedEconomicSector: EconomicSector) {
    let preselectedValue: OptionItem;

    if (preselectedEconomicSector) {
      preselectedValue = this.availableEconomicSectors.find(
        econSector => econSector.id === preselectedEconomicSector.id
      );
    }

    return preselectedValue;
  }
}
