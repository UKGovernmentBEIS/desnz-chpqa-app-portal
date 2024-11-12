import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectSelectedScheme, SharedFacade } from '@shared/store';
import { submitSchemeDetails } from '../../store';
import { combineLatest, first, map } from 'rxjs';
import { NavigationService } from '@shared/services/navigation.service';
import { AssessorReviewDecisionForm, AssessorReviewDecisionFormInfo } from '@shared/models';
import { ReviewDecisionFormComponent } from 'src/app/features/assessor/components/review-decision/pages/review-decision-form/review-decision-form.component';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-review-address-and-site-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, ReviewDecisionFormComponent, DynamicFormErrorsSummaryComponent],
  templateUrl: './review-address-and-site-contact.component.html',
})
export class ReviewAddressAndSiteContactComponent implements OnInit {
  assessorForm: FormGroup;
  assessorFormUpdated: boolean;
  assessorFormValidationMessages: any;

  formTitle = '';
  formHeader = '';
  selectedPersonLabel = '';

  private scheme$ = this.store.select(selectSelectedScheme);
  private isSubmissionNonEditable$ = this.sharedFacade.isSubmissionNonEditable();
  private isUserAnAssessor$ = this.sharedFacade.isUserAnAssessor();

  viewModel$ = combineLatest([this.scheme$, this.isSubmissionNonEditable$, this.isUserAnAssessor$]).pipe(
    map(([scheme, isSubmissionNonEditable, isUserAnAssessor]) => ({
      scheme,
      isSubmissionNonEditable,
      isUserAnAssessor,
    }))
  );

  constructor(
    private cdRef: ChangeDetectorRef,
    private nagivationService: NavigationService,
    private sharedFacade: SharedFacade,
    private readonly store: Store,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.setFormHeader();
  }

  submitClick(isSubmissionNonEditable: boolean) {
    isSubmissionNonEditable ? this.nagivationService.navigateToTaskList() : this.store.dispatch(submitSchemeDetails());
  }

  handleAssessorFormInfo(event: AssessorReviewDecisionFormInfo) {
    this.assessorForm = event?.assessorForm;
    this.assessorFormUpdated = event?.assessorFormUpdated;
    this.assessorFormValidationMessages = event?.assessorFormValidationMessages;

    this.cdRef.detectChanges();
  }

  setFormHeader(): void {
    this.isUserAnAssessor$.pipe(first()).subscribe(isAssessor => {
      if (isAssessor) {
        this.formHeader = 'Review Responsible Person and site contact';
        this.selectedPersonLabel = 'Responsible person';
        this.formTitle = 'Address and site contact';
      } else {
        this.formHeader = 'Review your answers';
        this.selectedPersonLabel = 'Selected person';
        this.formTitle = 'RP and site contact';
      }
    });
  }

  handleAssessorFormSubmission(event: { formValue: AssessorReviewDecisionForm; reviewScreenName: string }) {
    this.sharedFacade.handleAssessorFormSubmission(event);
  }

  goBack(): void {
    this.location.back();
  }
}
