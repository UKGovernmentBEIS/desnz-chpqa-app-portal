import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { CompanyHouseService } from '@shared/services';
import { combineLatest, map } from 'rxjs';
import { RegistrationConfirmationPath } from '../../models/registration-confirmation-path.model';
import { navigateToChoosePasswordForm, selectOrganisation } from '../../store';

@Component({
  selector: 'app-confirm-organisation-address',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirm-organisation-address.component.html',
  styleUrl: './confirm-organisation-address.component.scss',
})
export class ConfirmOrganisationAddressComponent {
  searchAddress = `../${RegistrationConfirmationPath.SEARCH_ORGANISATION_ADDRESS}`;

  organisation$ = this.store.select(selectOrganisation);
  organisationSicCodes$ = this.companyHouseService.getSicCodes();
  vm$ = combineLatest([this.organisation$, this.organisationSicCodes$]).pipe(
    map(([organisation, organisationSicCodes]) => {
      const backUrl = organisation?.registrationNumber
        ? `../${RegistrationConfirmationPath.ENTER_RESPONSIBLE_PERSON}`
        : `../${RegistrationConfirmationPath.SELECT_ORGANISATION_ADDRESS}`;

      return {
        organisation,
        organisationSicCodes,
        backUrl
      };
    })
  );

  constructor(
    private companyHouseService: CompanyHouseService,
    private store: Store
  ) {}

  onContinue() {
    this.store.dispatch(navigateToChoosePasswordForm());
  }
}
