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
import { EconomicSubSector } from 'src/app/api-services/chpqa-api/generated';
import { RouterModule } from '@angular/router';
import { SchemeRegistartiondPath } from 'src/app/tasks/scheme-registration/models/scheme-registration-path.model';
import { Store } from '@ngrx/store';
import { combineLatest, map, switchMap } from 'rxjs';
import { selectEconomicSector, selectEconomicSubSector, setEconomicSubSector } from 'src/app/tasks/scheme-registration/store';
import { EconomicSectorService } from '../../services/economic-sector.service';
import { AsyncPipe } from '@angular/common';
import { schemeRegistrationCopy } from 'src/app/tasks/scheme-registration/config/scheme-registration-copy-config';

@Component({
  selector: 'app-select-economic-sub-sector',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    RouterModule,
    FormErrorDirective,
    GovukSelectInputComponent
  ],
  templateUrl: './select-economic-sub-sector.component.html'
})
export class SelectEconomicSubSectorComponent {
  BACK = `../${SchemeRegistartiondPath.SELECT_ECONOMIC_SECTOR}`;
  availableEconomicSubSectors: OptionItem[] = [];

  copy = schemeRegistrationCopy;

  private readonly econSector$ = this.store.select(selectEconomicSector);
  private readonly preselectedEconSubSec$ = this.store.select(selectEconomicSubSector);
  
  form$ = combineLatest([this.econSector$, this.preselectedEconSubSec$]).pipe(
    switchMap(([economicSector, preselectedEconomicSubSec]) => {
      return this.economicSectorService.getSubSectors(economicSector).pipe(
        map(economicSubSectors => ({
          economicSubSectors,
          preselectedEconomicSubSec
        }))
      );
    }),
    map(response => {
      const econSubSectors = response.economicSubSectors;
      const preselectedEconomicSubSec = response.preselectedEconomicSubSec;

      this.availableEconomicSubSectors = this.buildEconomicSubSectorOptions(econSubSectors);
      const preselectedValue = this.getPreselectedFormValue(preselectedEconomicSubSec);

      return this.fb.group({
        econSubSector: [preselectedValue, [Validators.required]],
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
      this.store.dispatch(setEconomicSubSector(form.getRawValue()));
    }
  }

  private buildEconomicSubSectorOptions(economicSubSectors: EconomicSubSector[]) {
    return economicSubSectors.map(economicSubSector => ({
      id: economicSubSector.id,
      name: economicSubSector.name,
    }));
  }

  private getPreselectedFormValue(preselectedEconomicSubSector: EconomicSubSector) {
    let preselectedValue: OptionItem;

    if (preselectedEconomicSubSector) {
      preselectedValue = this.availableEconomicSubSectors.find(
        econSector => econSector.id === preselectedEconomicSubSector.id
      );
    }

    return preselectedValue;
  }
}
