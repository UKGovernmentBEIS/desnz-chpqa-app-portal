import { Injectable } from '@angular/core';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { CondensingSteamTurbine } from '../models/f4-form.model';
import { Observable } from 'rxjs';
import {
  RequestReturnId,
  RequestUpdateSubmissionZRatio,
} from 'src/app/api-services/chpqa-api/generated';
import { Status } from '@shared/enums/status.enum';

@Injectable({
  providedIn: 'root',
})
export class CondensingSteamTurbineService {
  constructor(private chqpaApiServiceWrapper: ChqpaApiServiceWrapper) {}

  submitCondensingSteamTurbine(
    submissionFormId: string,
    groupId: string,
    status: Status,
    condensingSteamTurbine: CondensingSteamTurbine
  ): Observable<RequestReturnId> {
    const requestUpdateSubmissionZRatio: RequestUpdateSubmissionZRatio = {
      idSubmission: submissionFormId,
      zRatioDetermined: condensingSteamTurbine.zRatioDetermined.value as boolean,
      steamExportPressure: condensingSteamTurbine.steamExportPressure,
      steamturbinesize: condensingSteamTurbine.steamTurbineSize,
      zratio: condensingSteamTurbine.zRatio,
    };
    return this.chqpaApiServiceWrapper.updSubmZRatioService.apiSecureUpdSubmZRatioPost(
      requestUpdateSubmissionZRatio
    );
  }
}
