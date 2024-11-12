import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookies-pop-up',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './cookies-pop-up.component.html',
  styleUrl: './cookies-pop-up.component.scss'
})
export class CookiesPopUpComponent {

  @Input()
  areCookiesAccepted: boolean;

  @Output() readonly cookiesAcceptedEmitter = new EventEmitter<boolean>();

  showConfirmation = false;

  cookiesNotAccepted() {
    return this.areCookiesAccepted === false;
  }

  acceptCookies() {
    this.showConfirmation = true;
    this.cookiesAcceptedEmitter.emit(true);
  }

  rejectCookies() {
    this.showConfirmation = true;
    this.cookiesAcceptedEmitter.emit(false);
  }

  viewCookies() {

  }

  hideCookieMessage() {
    this.showConfirmation = false;
  }

}
