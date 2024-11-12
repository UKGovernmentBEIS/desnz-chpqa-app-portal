import { Injectable } from '@angular/core';
import { Status } from '@shared/enums/status.enum';
import { Observable, map } from 'rxjs';
import {
  EnergyInput,
} from '../models/f4-form.model';
import { SubmissionFormType } from '@shared/enums/form-submission.enum';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { ReplyEnergyInput, RequestEnergyInput, RequestReturnId, RequestUpdateSubmissionEnergyInput } from 'src/app/api-services/chpqa-api/generated';
import { mapMonths } from '../utils/f4-form.utils';

@Injectable({
  providedIn: 'root',
})
export class EnergyInputsService {
  constructor(
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper
  ) {} 

  fetchEnergyInputs(submissionFormId: string): Observable<EnergyInput[]> {
    return this.chqpaApiServiceWrapper.getEnergyInputListBySubmIdService
      .apiSecureGetEnergyInputListBySubmIdGet(submissionFormId)
      .pipe(
        map((energyInputResponse: ReplyEnergyInput[]) =>
          energyInputResponse.map(response =>
            this.transformResponseToEnergyInput(response)
          )
        )
      );
  }

  submitEnergyInputs(
    submissionFormId: string,
    totalFuelEnergyInputs: number,
    energyInputs: EnergyInput[],
    chpTotalPowerCapacity: number,
    formSubmissionType: SubmissionFormType,
    estimatedTotalFuelEnergyPrimeEngines: number,
    estimatedTotalFuelEnergyBoilers: number
  ): Observable<RequestReturnId> {
    const energyInputRequests = energyInputs
      .filter(energyInput => energyInput.type.id)
      .map(energyInput =>
        this.createEnergyInputRequest(energyInput, formSubmissionType)
      );
    const requestUpdateSubmissionEnergyInput: RequestUpdateSubmissionEnergyInput = {
      idSubmission: submissionFormId,
      totalFuelEnergyInputs: totalFuelEnergyInputs,
      policyId: '569f9425-062e-ef11-840a-6045bddf4514', // TODO back end not ready yet
      rocscfdPolicyId: '579f9425-062e-ef11-840a-6045bddf4514', // TODO back end not ready yet
      chpTotalPowerCapacity: chpTotalPowerCapacity,
      energyInputList: energyInputRequests,
      estimatedTotalFuelEnergyPrimeEngines:
        estimatedTotalFuelEnergyPrimeEngines,
      estimatedTotalFuelEnergyBoilers: estimatedTotalFuelEnergyBoilers,
    };
    return this.chqpaApiServiceWrapper.updSubmEnergyInputListService.apiSecureUpdSubmEnergyInputListPost(requestUpdateSubmissionEnergyInput)
  }

  private transformResponseToEnergyInput(
    response: ReplyEnergyInput
  ): EnergyInput {
    return {
      id: response.id,
      tag: response.tag,
      tagNumber: response.tagNumber,
      tagPrefix: response.tagPrefix,
      userTag: response.userTag,
      serialNumber: response.serialNumber,
      meter: { id: response.meter?.id, name: response.meter?.name },
      category: {
        id: response.fuelCategory?.id,
        name: response.fuelCategory?.name,
      },
      type: { id: response.fuel?.id, name: response.fuel?.name },
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
      tfi: response.fractionTFI,
      months: mapMonths(response),
    };
  }

  private createEnergyInputRequest(
    energyInput: EnergyInput,
    formSubmissionType: SubmissionFormType
  ): RequestEnergyInput {
    const {
      months,
      id,
      category,
      type,
      includeInCalculations,
      annualTotal,
      tfi,
    } = energyInput;
    return {
      id,
      fuelCategory: category,
      fuel: type,
      includeInCalculations: includeInCalculations.value as boolean,
      annualTotal: annualTotal ?? 0,
      fractionTFI: tfi,
      ...months,
      ...(formSubmissionType === SubmissionFormType.F4s && {
        fractionTFI: 100,
      }),
    };
  }
}
