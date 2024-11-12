import { Injectable } from '@angular/core';
import { UserRequest } from '@shared/models';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';

@Injectable({
  providedIn: 'root',
})
export class RegisterUserService {
  constructor(private chqpaApiServiceWrapper: ChqpaApiServiceWrapper) {}

  registerUser(user: UserRequest) {
    const userRequest = {
      ...user,
      address1: "",
      address2: "",
      town: "",
      county: "",
      postcode: "",
    } //TODO

    return this.chqpaApiServiceWrapper.registerUserService.apiRegisterUserPost(userRequest);
  }
}
