import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as formWizardStore from './store';
import { FORM_WIZARD_ROUTES } from './form-wizard-routes';
import { FormWizardEffects } from './store/form-wizard.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(FORM_WIZARD_ROUTES),
    StoreModule.forFeature(
      formWizardStore.formWizardFeature
    ),
    EffectsModule.forFeature([FormWizardEffects]),
  ],
})
export class FormWizardModule {}
