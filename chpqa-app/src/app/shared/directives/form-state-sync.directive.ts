import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { updateFormState } from '@shared/store';
import { debounceTime, Subscription } from 'rxjs';

@Directive({
  selector: '[appFormStateSync]',
  standalone: true,
})
export class FormStateSyncDirective implements OnInit, OnDestroy {
  @Input('appFormStateSync') formGroup!: FormGroup;
  @Input() formName!: string;
  private formSubscription!: Subscription;

  constructor(private store: Store) {}

  ngOnInit(): void {
    if (!this.formGroup) {
      console.error(`[FormStateSyncDirective] No formGroup provided! Aborting directive setup.`);
      return;
    }

    if (!this.formName) {
      console.error(`[FormStateSyncDirective] No formName provided!`);
      return;
    }

    // Dispatch the initial form value to the store
    const initialFormData = this.formGroup.getRawValue();
    this.store.dispatch(updateFormState({ formName: this.formName, formData: initialFormData }));

    // Listen to form value changes and dispatch updates to the specific form state
    this.formSubscription = this.formGroup.valueChanges.pipe(debounceTime(300)).subscribe(formData => {
      this.store.dispatch(updateFormState({ formName: this.formName, formData }));
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe when the directive is destroyed to prevent memory leaks
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }
}
