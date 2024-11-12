import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { VerifyTokenRequest } from '../models/verify-token.model';

@Injectable({
  providedIn: 'root',
})
export class VerifyTokenService {
  constructor(
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper
  ) {}

  verifyToken(verifyTokenRequest: VerifyTokenRequest) {
    return this.chqpaApiServiceWrapper.verifyTokenService.apiVerifyTokenPost(verifyTokenRequest as any).pipe(map(response => response));
  }
}
