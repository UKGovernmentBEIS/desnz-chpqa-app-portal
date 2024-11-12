import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-timeout-modal',
  template: `
    <div id="timeout-modal" class="govuk-modal" aria-labelledby="timeout-modal-title" role="alertdialog"
      *ngIf="visible" [attr.aria-hidden]="!visible" tabindex="-1">
      <div class="govuk-modal__dialog" role="document">
        <div class="govuk-modal__content">
          <h1 class="govuk-heading-m" id="timeout-modal-title">You’re about to be signed out</h1>
          <p class="govuk-body">
            For your security, we will sign you out in <b>{{ countdown }} minute{{ countdown > 1 ? 's' : '' }} </b>.
          </p>
          <div class="govuk-button-group">
            <button type="button" class="govuk-button" (click)="onStaySignedIn()">Stay signed in</button>
            <a href="#" class="govuk-link" (click)="onSignOut($event)">Sign out</a>
          </div>
        </div>
      </div>
    </div>
    <div class="govuk-modal__overlay" *ngIf="visible"></div>
  `,
  styles: [`
    .govuk-modal {
      position: fixed;
      z-index: 100;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.7);
    }
    .govuk-modal__dialog {
      background: white;
      padding: 1px;
    }
    .govuk-modal__content{
      border: 5px solid black;
      padding: 1rem;
    }
    .govuk-modal__overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 99;
    }
  `],
})
export class TimeoutModalComponent {
  @Input() visible = false;
  @Input() countdown = 2;
  @Output() staySignedIn = new EventEmitter<void>();
  @Output() signOut = new EventEmitter<void>();

  onStaySignedIn(): void {
    this.staySignedIn.emit();
  }

  onSignOut(event: Event): void {
    event.preventDefault();
    this.signOut.emit();
  }
}
