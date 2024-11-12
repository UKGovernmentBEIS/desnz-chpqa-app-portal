import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, distinctUntilChanged } from 'rxjs';
import { ResponsiblePersonFormComponent } from '@shared/components/responsible-person-details-form/responsible-person-details-form.component';
import { CompanyHouseService } from '@shared/services';
import { ResponsiblePerson, ResponsiblePersonForm } from '@shared/models';
import { RegistrationConfirmationPath } from '../../models/registration-confirmation-path.model';
import {
  selectRegisteredResponsiblePerson,
  setResponsiblePerson,
} from '../../store';

@Component({
  selector: 'app-enter-responsible-person-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ResponsiblePersonFormComponent],
  templateUrl: './enter-responsible-person-form.component.html',
  styleUrl: './enter-responsible-person-form.component.scss',
})
export class EnterResponsiblePersonFormComponent implements OnInit {
  responsiblePerson$: Observable<ResponsiblePerson>;

  constructor(
    private store: Store,
    private companyHouseService: CompanyHouseService
  ) {}

  ngOnInit() {
    this.responsiblePerson$ = this.store
      .select(selectRegisteredResponsiblePerson)
      .pipe(distinctUntilChanged());
  }

  onFormSubmitted(responsiblePersonForm: ResponsiblePersonForm): void {
    this.store.dispatch(setResponsiblePerson({ responsiblePersonForm }));
  }
}
