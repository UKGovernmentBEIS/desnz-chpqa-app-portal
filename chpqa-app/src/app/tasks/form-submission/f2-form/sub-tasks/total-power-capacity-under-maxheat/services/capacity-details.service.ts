import { Injectable } from '@angular/core';
import { Status } from '@shared/enums/status.enum';
import { map } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';

interface TotalPowerCapacityUnderMaxHeatPayload {
  idSubmission: string;
  idGroup: string;
  status: Status;
  totalPowCapUnderMaxHeatConds: number;
}

@Injectable({
  providedIn: 'root',
})
export class CapacityDetailsService {
  constructor(private chqpaApiServiceWrapper: ChqpaApiServiceWrapper) {}

  updateTotalCapacityUnderMaxHeat(totalCapacityUnderMaxHeat: number, submissionId: string, groupId: string) {
    const payload: TotalPowerCapacityUnderMaxHeatPayload = {
      idSubmission: submissionId,
      idGroup: groupId,
      status: Status.Completed,
      totalPowCapUnderMaxHeatConds: totalCapacityUnderMaxHeat
    };

    return this.chqpaApiServiceWrapper.updSubmTotalPowCapMaxHeatCondService.apiSecureUpdSubmTotalPowCapMaxHeatCondPost(payload).pipe(map(response => response));
  }
}
