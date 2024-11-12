import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Input, SimpleChanges, OnChanges, ElementRef, ViewChild, Inject, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPageScrollCoreModule, PageScrollOptions, PageScrollService } from 'ngx-page-scroll-core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dynamic-form-errors-summary',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxPageScrollCoreModule],
  template: `
    <div *ngIf="errors?.length > 0" class="govuk-error-summary" data-module="govuk-error-summary" #errorsummary>
      <div role="alert">
        <h2 class="govuk-error-summary__title">There is a problem</h2>
        <div class="govuk-error-summary__body">
          <ul class="govuk-list govuk-error-summary__list">
            <li *ngFor="let error of errors">
              <a (click)="onClick(error.field)" [routerLink]="[]">{{ getErrorMessage(error.field, error.error) }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
})
export class DynamicFormErrorsSummaryComponent implements OnInit, OnDestroy, OnChanges {
  constructor(
    private pageScrollService: PageScrollService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  errors: { field: string; error: string }[] = [];
  private statusChangeSubscription: Subscription;

  @Input() formUpdated: any;
  @Input() form: FormGroup;
  @Input() validationMessages: { [key: string]: any };
  @Input() displaySingleError: boolean = false;

  @ViewChild('errorsummary') errorSummaryElementRef: ElementRef;

  ngOnInit() {
    this.statusChangeSubscription = this.form.statusChanges.subscribe(() => {
      this.updateErrors();
    });
  }

  ngOnDestroy() {
    if (this.statusChangeSubscription) {
      this.statusChangeSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.formUpdated) {
      this.updateErrors();
    }
  }

  updateErrors() {
    this.errors = [];
    this.collectErrors(this.form.controls);

    // Check for form-level errors
    const formErrors = this.form.errors;
    if (formErrors) {
      Object.keys(formErrors).forEach(errorKey => {
        this.errors.push({
          field: 'formErrors',
          error: errorKey,
        });
      });
    }
  }

  collectErrors(controls: { [key: string]: AbstractControl }, parentKey: string = '') {
    for (const key in controls) {
      const control = controls[key];
      if (control instanceof FormGroup) {
        this.collectErrors(control.controls, key);
      } else if (control.invalid && (control.touched || control.dirty)) {
        const controlErrors = control.errors;
        const controlKey = parentKey ? `${parentKey}.${key}` : key;
        if (controlErrors) {
          Object.keys(controlErrors).forEach((errorKey, index) => {
            if (!this.displaySingleError || index === 0) {
              this.errors.push({
                field: controlKey,
                error: errorKey,
              });
            }
          });
        }
      }
    }
  }

  getErrorMessage(field: string, errorKey: string): string {
    if (field === 'formErrors') {
      return this.validationMessages.formErrors?.[errorKey] || 'Invalid field';
    }

    const fieldParts = field.split('.');

    let validationMessage = this.validationMessages;
    for (const part of fieldParts) {
      validationMessage = validationMessage[part];
    }
    return validationMessage[errorKey] || 'Invalid field';
  }

  addControlError(controlName: string, errorKey: string, errorMessage: string) {
    const control = this.form.get(controlName);
    if (control) {
      control.setErrors({ [errorKey]: errorMessage });
    }
    this.updateErrors();
  }

  onClick(anchor: string): void {
    const parts = anchor.split('.');
    const targetId = parts.length > 1 ? parts[parts.length -1] : anchor;
    const targetElement = this.document.getElementById(targetId);

    if (targetElement) {
      const pageScrollOptions: PageScrollOptions = {
        document: this.document,
        duration: 100,
        scrollTarget: `#${anchor}`,
        scrollOffset: 300,
        interruptible: false,
      };
      this.pageScrollService.scroll(pageScrollOptions);

      setTimeout(() => {
        targetElement.focus();
      }, 100);
    } else {
      console.warn(`Scrolling not possible, as can't find the specified target: ${anchor}`);
    }

    setTimeout(() => {
      this.errorSummaryElementRef.nativeElement.blur();
    });
  }
}
