import { Injectable, Injector } from '@angular/core';
import { Status } from '@shared/enums/status.enum';
import { Observable, map } from 'rxjs';
import { HeatMonitoring, HeatType } from '../../models/f4-form.model';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import {
  ReplyHeatOutput,
  RequestHeatOutput,
  RequestReturnId,
  RequestUpdateSubmissionHeatOutput,
  UpdateHeatRejectionFacility,
} from 'src/app/api-services/chpqa-api/generated';
import { mapMonths } from '../../utils/f4-form.utils';

export interface RejectionHeatOutputsModel {
  idSubmission: string;
  idGroup: string;
  status: number;
  heatRejectionFacility: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HeatMonitoringDataService {

  constructor(
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
  ) {}

  fetchHeatOutputs(submissionFormId: string): Observable<HeatMonitoring[]> {
    return this.chqpaApiServiceWrapper.getHeatOutputListBySubmIdService.apiSecureGetHeatOutputListBySubmIdGet(submissionFormId).pipe(
      map((response: ReplyHeatOutput[]) => {
        return response.map(data => this.transformResponseToHeatOutput(data));
      })
    );
  }

  submitRejectionHeatOutputs(submissionFormId: string, groupId: string, heatRejectionFacility: boolean): Observable<RequestReturnId> {
    const payload: UpdateHeatRejectionFacility = {
      idSubmission: submissionFormId,
      heatRejectionFacility: heatRejectionFacility,
    };

    return this.chqpaApiServiceWrapper.updSubmHeatRejFacService.apiSecureUpdSubmHeatRejFacPost(payload);
  }

  submitHeatOutputs(
    submissionFormId: string,
    groupId: string,
    status: Status,
    heatOutputs: HeatMonitoring[],
    totalHeatExported: number,
    qualifyingHeatOutput: number,
    estimatedTotalHeatOutputUsedInthePrimeMovers: number,
    estimatedTotalHeatOutputUsedIntheBoilers: number
  ): Observable<RequestReturnId> {
    const submitHeatOutputsRequest = heatOutputs.filter(heatOutput => heatOutput.type.id).map(heatOutput => this.createHeatOutput(heatOutput));
    const payload: RequestUpdateSubmissionHeatOutput = {
      idSubmission: submissionFormId,
      qualifyingHeatOutput: qualifyingHeatOutput,
      totalHeatExported: totalHeatExported,
      heatOutputList: submitHeatOutputsRequest,
      estimatedTotalHeatOutputUsedInthePrimeMovers: estimatedTotalHeatOutputUsedInthePrimeMovers,
      estimatedTotalHeatOutputUsedIntheBoilers: estimatedTotalHeatOutputUsedIntheBoilers,
    };
    return this.chqpaApiServiceWrapper.updSubmHeatOutputListService.apiUpdSubmHeatOutputListPost(payload);
  }

  private transformResponseToHeatOutput(response: ReplyHeatOutput): HeatMonitoring {
    return {
      id: response.id,
      tag: response.tag,
      tagNumber: response.tagNumber,
      tagPrefix: response.tagPrefix,
      userTag: response.userTag,
      serialNumber: response.serialNumber,
      includeInCalculations: {
        label: response.includeInCalculations !== null ? (response.includeInCalculations ? 'Yes' : 'No') : null,
        value: response.includeInCalculations !== null ? response.includeInCalculations : null,
      },
      type: {
        id: response.heatType?.toString(),
        name: this.transformHeatType(response.heatType),
      },
      category: { id: response.meterType?.id, name: response.meterType?.name },
      meter: { id: response.meter?.id, name: response.meter?.name },
      annualTotal: response.annualTotal,
      months: mapMonths(response),
    };
  }

  private transformHeatType(heatType: HeatType): string {
    switch(heatType) {
      case HeatType.SuppliedToSite:
        return 'Supplied to site';
      case HeatType.Exported:
        return 'Exported';
    }
  }

  private createHeatOutput(heatOutput: HeatMonitoring): RequestHeatOutput {
    return {
      id: heatOutput.id,
      heatType: parseInt(heatOutput.type.id),
      includeInCalculations: heatOutput.includeInCalculations.value as boolean,
      annualTotal: heatOutput.annualTotal,
      ...heatOutput.months
    } as RequestHeatOutput;
  }
}
