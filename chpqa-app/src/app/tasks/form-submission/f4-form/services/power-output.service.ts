import { Injectable } from '@angular/core';
import { Status } from '@shared/enums/status.enum';
import { Observable, map } from 'rxjs';
import {
  PowerOutput,
  PowerType,
} from '../models/f4-form.model';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import {
  ReplyPowerOutput,
  RequestPowerOutput,
  RequestReturnId,
  RequestUpdateSubmissionPowerOutput,
} from 'src/app/api-services/chpqa-api/generated';
import { mapMonths } from '../utils/f4-form.utils';

@Injectable({
  providedIn: 'root',
})
export class PowerOutputService {
  constructor(
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper
  ) {}

  fetchPowerOutputs(submissionFormId: string): Observable<PowerOutput[]> {
    return this.chqpaApiServiceWrapper.getPowerOutputListBySubmIdService
      .apiSecureGetPowerOutputListBySubmIdGet(submissionFormId)
      .pipe(
        map((powerOutputResponse: ReplyPowerOutput[]) =>
          powerOutputResponse.map(response =>
            this.transformResponseToPowerOutput(response)
          )
        )
      );
  }

  submitPowerOutputs(
    submissionFormId: string,
    groupId: string,
    status: Status,
    totalPowerOutputsGenerated: number,
    totalExportedPower: number,
    totalImportedPower: number,
    powerOutputs: PowerOutput[]
  ): Observable<RequestReturnId> {
    const submitPowerOutputsRequest = powerOutputs
      .filter(powerOutput => powerOutput.type.id)
      .map(powerOutput => this.createPowerOutputRequest(powerOutput));

    const requestUpdateSubmissionPowerOutput: RequestUpdateSubmissionPowerOutput =
      {
        idSubmission: submissionFormId,
        totalPowerGenerated: totalPowerOutputsGenerated,
        totalPowerExported: totalExportedPower,
        totalPowerImported: totalImportedPower,
        powerOutputList: submitPowerOutputsRequest,
      };

    return this.chqpaApiServiceWrapper.updSubmPowerOutputListService.apiSecureUpdSubmPowerOutputListPost(
      requestUpdateSubmissionPowerOutput
    );
  }

  private transformResponseToPowerOutput(
    response: ReplyPowerOutput
  ): PowerOutput {
    return {
      id: response.id,
      tag: response.tag,
      tagNumber: response.tagNumber,
      tagPrefix: response.tagPrefix,
      userTag: response.userTag,
      serialNumber: response.serialNumber,
      meter: { id: response.meter?.id, name: response.meter?.name },
      category: { id: response.meterType?.id, name: response.meterType?.name },
      type: {
        id: response.powerType?.toString(),
        name: PowerType[response.powerType],
      },
      diagramReferenceNumber: response.diagramReferenceNumber,
      includeInCalculations: {
        label:
          response.includeInCalculations !== null
            ? response.includeInCalculations
              ? 'Yes'
              : 'No'
            : null,
        value:
          response.includeInCalculations !== null
            ? response.includeInCalculations
            : null,
      },
      annualTotal: response.annualTotal,
      months: mapMonths(response),
    };
  }

  private createPowerOutputRequest(
    powerOutput: PowerOutput
  ): RequestPowerOutput {
    const { id, type, includeInCalculations, annualTotal, months } =
      powerOutput;
    return {
      id: id,
      powerType: parseInt(type.id),
      includeInCalculations: includeInCalculations.value as boolean,
      annualTotal: annualTotal ?? 0,
      ...months,
    };
  }
}
