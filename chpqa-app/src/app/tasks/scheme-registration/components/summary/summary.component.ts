import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SchemeRegistartiondPath } from '../../models/scheme-registration-path.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectScheme, selectSicCode, submitScheme } from '../../store';
import {
  PersonDetails,
  SchemeRegistration,
} from '../../models/scheme-registration.model';
import { combineLatest, map, Observable } from 'rxjs';
import { selectUser } from 'src/app/auth/auth.selector';
import { CompanyHouseService } from '@shared/services';
import {
  EconomicSector,
  SicCode,
} from 'src/app/api-services/chpqa-api/generated';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryComponent {
  BACK = `../${SchemeRegistartiondPath.CONFIRM_SITE_CONTACT}`;
  ENTER_SCHEME_NAME = `${SchemeRegistartiondPath.BASE_PATH}/${SchemeRegistartiondPath.ENTER_SCHEME_NAME}`;
  SELECT_SIC_OR_ECON = `${SchemeRegistartiondPath.BASE_PATH}/${SchemeRegistartiondPath.SELECT_SIC_CODE}`;
  SITE_CONTACT_DETAILS = `${SchemeRegistartiondPath.BASE_PATH}/${SchemeRegistartiondPath.SITE_CONTACT_DETAILS}`;

  sicOrEconSectionLabel!: string;
  sicOrEconSectionValue!: string;
  sicOrEconAriaLabel: string;
  showChangeButton!: boolean;

  ChangeLinkAriaLabel = ChangeLinkAriaLabel;

  scheme$: Observable<SchemeRegistration> = this.store.select(selectScheme);
  schemeSicCode$: Observable<SicCode> = this.store.select(selectSicCode);
  user$: Observable<PersonDetails> = this.store.select(selectUser);
  companySicCodes$ = this.companyHouseService.getSicCodes();
  vm$ = combineLatest([this.scheme$, this.schemeSicCode$, this.user$, this.companySicCodes$]).pipe(
    map(([scheme, schemeSicCode, user, companySicCodes]) => {
      this.prepareSicOrEconSectorSection(companySicCodes, scheme, schemeSicCode);

      return {
        scheme,
        user,
      };
    })
  );

  constructor(
    private companyHouseService: CompanyHouseService,
    private store: Store
  ) {}

  private showChangeButtonForSicOrEcon(
    companySicCodes: SicCode[],
    economicSector: EconomicSector
  ) {
    const hasManySicCodes = companySicCodes && companySicCodes?.length > 1;
    return (hasManySicCodes || economicSector) as boolean;
  }

  private prepareSicOrEconSectorSection(
    companySicCodes: SicCode[],
    scheme: SchemeRegistration,
    schemeSicCode: SicCode
  ) {
    this.showChangeButton = this.showChangeButtonForSicOrEcon(
      companySicCodes,
      scheme.econSector
    );

    this.sicOrEconSectionLabel = this.getSicOrEconSectionLabel(schemeSicCode);

    this.sicOrEconSectionValue = this.getSicOrEconSectionValue(
      schemeSicCode,
      scheme.econSector
    );
    this.sicOrEconAriaLabel = `Change the ${this.sicOrEconSectionLabel}`;
  }

  private getSicOrEconSectionLabel(sicCode?: SicCode) {
    return sicCode ? 'SIC Code' : 'Economic Sector';
  }

  private getSicOrEconSectionValue(
    sicCode?: SicCode,
    economicSector?: EconomicSector
  ) {
    return sicCode
      ? `${sicCode.name}: ${sicCode.description}`
      : economicSector?.name;
  }

  onSubmit() {
    this.store.dispatch(submitScheme());
  }
}
