import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormWizardPath } from '../../models/form-wizard-path.model';
import { AsyncPipe, NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectSelectedScheme } from '@shared/store';
import { setIsOperational } from '../../store/form-wizard.actions';

@Component({
  selector: 'app-before-start',
  standalone: true,
  templateUrl: './before-start.component.html',
  styleUrl: './before-start.component.scss',
  imports: [RouterModule, AsyncPipe, NgIf],
})
export class BeforeStartComponent {
  BACK = '/request-task-page';
  scheme$ = this.store.select(selectSelectedScheme);

  constructor(
    private router: Router,
    private store: Store
  ) {}

  onContinue(schemeId: string) {
    this.router.navigate([
      FormWizardPath.BASE_PATH,
      schemeId,
      FormWizardPath.CHOOSE_CRITERIA,
    ]);
    // this.router.navigate([
    //   FormWizardPath.BASE_PATH,
    //   schemeId,
    //   FormWizardPath.CHOOSE_OPERATIONAL,
    // ]);
  }
}
