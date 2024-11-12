import { Injectable } from '@angular/core';
import { SendRegistrationEmailRequest } from '../models/registration-request.model';
import { tap } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';

@Injectable({
  providedIn: 'root'
})
export class SendEmailVerificationService {

  constructor(private chqpaApiServiceWrapper: ChqpaApiServiceWrapper) { }

  sendRegistrationEmail(sendRegistrationEmailRequest: SendRegistrationEmailRequest) {
    return this.chqpaApiServiceWrapper.sendRegistrationEmailService.apiSendRegEmailPost(sendRegistrationEmailRequest).pipe(
      tap(response => {
       console.log(response);
      })
    );
  }
}
