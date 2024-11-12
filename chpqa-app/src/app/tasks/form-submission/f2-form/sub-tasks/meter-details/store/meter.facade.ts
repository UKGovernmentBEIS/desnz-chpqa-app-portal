import { Injectable } from '@angular/core';
import { MeterService } from '../services/meter.service';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, withLatestFrom } from 'rxjs';
import { mapFiles, mapToOptionItem, mapToRadioButtonOption } from '@shared/utils/data-transform-utils';
import { Meter } from '@shared/models/form-submission.model';
import { MeasureType, SubmissionFormType } from '@shared/enums/form-submission.enum';
import { ReplyMeter, RequestMeter, RequestUpdateSubmissionMeterList } from 'src/app/api-services/chpqa-api/generated';
import { select, Store } from '@ngrx/store';
import { MeterCrudService } from '../services/meter-crud.service';
import { selectSubmissionFormId } from '@shared/store';
import { ArrayItemState } from '@shared/models/array-item-state';
import { EquipmentService } from '../../../services/equipment.service';
import { selectFormSubmissionType } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { setMeterState } from './meter.actions';
import { selectMeterIndex } from './meter.selectors';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';

@Injectable({
  providedIn: 'root',
})
export class MeterFacade {
  private isSubmittingMetersSubject = new BehaviorSubject<boolean>(false);
  isSubmittingMeters$ = this.isSubmittingMetersSubject.asObservable();

  private showDeleteSuccessBannerSubject = new BehaviorSubject<boolean>(false);
  showDeleteSuccessBanner$ = this.showDeleteSuccessBannerSubject.asObservable();

  constructor(
    private store: Store,
    private meterService: MeterService,
    private meterCrudService: MeterCrudService,
    private equipmentService: EquipmentService
  ) {}

  get meters$(): Observable<Meter[]> {
    return this.meterCrudService.meters$;
  }

  submitMeters$(): Observable<any> {
    return this.isSubmittingMeters$.pipe(
      take(1),
      filter(isSubmitting => !isSubmitting),
      tap(() => this.isSubmittingMetersSubject.next(true)),
      switchMap(() =>
        this.meterCrudService.meters$.pipe(
          withLatestFrom(
            this.store.pipe(select(selectSubmissionFormId)),
            this.store.pipe(select(selectFormSubmissionType)),
            this.equipmentService.getMeterTypeId()
          ),
          map(([meters, submissionId, formSubmissionType, meterTypeId]) => {
            const transformedMeters = meters
              .filter(meter => meter.state === ArrayItemState.New || meter.state === ArrayItemState.Touched)
              .map(meter => this.transformMeterToRequestMeter(meter, meterTypeId, formSubmissionType));
            return {
              idSubmission: submissionId,
              meterList: transformedMeters,
            } as RequestUpdateSubmissionMeterList;
          }),
          switchMap(meterSubmissionRequest => this.meterService.submitMeters(meterSubmissionRequest))
        )
      )
    );
  }

  fetchMeters(submissionId: string, formSubmissionType: SubmissionFormType): Observable<Meter[]> {
    return this.meterService.fetchMeters(submissionId).pipe(
      map(replyMeters => replyMeters.map((replyMeter, index) => this.transformReplyMeterToMeter(replyMeter, index, formSubmissionType))),
      tap(transformedMeters => this.setMeters(transformedMeters))
    );
  }

  addMeter(meter: Meter): void {
    const { index, state } = this.meterCrudService.addMeter(meter);
    this.store.dispatch(setMeterState({ arrayItemState: state, index }));
  }

  updateMeter(meter: Meter): void {
    this.meterCrudService.updateMeter(meter);
  }

  deleteMeter(submissionId: string, index: number, meterIdToDelete: string | null) {
    if (meterIdToDelete) {
      return this.meterService.deleteMeter(submissionId, meterIdToDelete).pipe(
        tap(() => this.meterCrudService.deleteMeter(index)),
        catchError(error => {
          console.error('Error deleting prime mover from server:', error);
          return of(null);
        })
      );
    } else {
      this.meterCrudService.deleteMeter(index);
      return of(null);
    }
  }

  setMeters(meters: Meter[]): void {
    this.meterCrudService.setMeters(meters);
  }

  resetMeters(): void {
    this.meterCrudService.setMeters([]);
  }

  hasMeasureType(measureType: MeasureType): Observable<boolean> {
    return this.meters$.pipe(map(meters => meters.some(meter => meter.measureType.value === measureType)));
  }

  downloadMeterFile(submissionId: string, fileId: string) {
    return this.meterService.downloadMeterFile(submissionId, fileId);
  }

  setSubmittingMetersSubject(value: boolean): void {
    this.isSubmittingMetersSubject.next(value);
  }

  resetSubmittingMetersState(): void {
    this.resetMeters();
    this.setSubmittingMetersSubject(false);
  }

  showDeleteSuccessBanner(): void {
    this.showDeleteSuccessBannerSubject.next(true);
  }

  hideDeleteSuccessBanner(): void {
    if (this.showDeleteSuccessBannerSubject.getValue() === true) {
      this.meterCrudService.recalculateMeterNames();
    }
    this.showDeleteSuccessBannerSubject.next(false);
  }

  getMeterName() {
    return this.store.select(selectMeterIndex).pipe(
      switchMap(index => {
        if (index !== undefined && index !== null) {
          return of('Meter ' + (index + 1));
        } else {
          return this.meters$.pipe(
            map(meters => 'Meter '+ (meters?.length +1))
          );
        }
      })
    );
  }
  
  private getMeasureType(measureType: MeasureType): RadioButtonOption {
    if (measureType === MeasureType.EnergyInput) {
      return { value: measureType, label: 'Energy Input' };
    } else if (measureType === MeasureType.HeatOutput) {
      return { value: measureType, label: 'Heat Output' };
    } else if (measureType === MeasureType.PowerOutput) {
      return { value: measureType, label: 'Power Output' };
    }
    return { value: null, label: '' };
  }

  private transformReplyMeterToMeter(replyMeter: ReplyMeter, index: number, formSubmissionType: SubmissionFormType): Meter {
    return {
      id: replyMeter.id || null,
      tagNumber: replyMeter.tagNumber || null,
      serialNumber: replyMeter.serialNumber,
      meterType: { id: replyMeter.equipmentSubType.id, name: replyMeter.equipmentSubType.name },
      yearInstalled: mapToOptionItem(replyMeter.yearInstalled),
      existingOrProposed: { label: replyMeter.existingOrProposed === 0 ? 'Existing' : 'Proposed', value: replyMeter.existingOrProposed === 0 ? true : false },
      measureType: this.getMeasureType(replyMeter.measureType),
      fiscal: replyMeter.mainGasMeter || false,
      fiscalPoint: parseInt(replyMeter.mainGasMeterNumber) ?? undefined,
      meteredService: undefined,
      meteredServiceF2s: undefined,
      outputRangeMin: replyMeter.outputRangeMin || 0,
      outputRangeMax: replyMeter.outputRangeMax || 0,
      outputUnit: { id: replyMeter.outputUnit.id, name: replyMeter.outputUnit.name },
      outputUnitOther: undefined,
      comments: replyMeter.comments || null,
      files: replyMeter.meterFilesList ? mapFiles(replyMeter.meterFilesList) : [],
      state: ArrayItemState.Unchanged,
      index: index,
      ...(formSubmissionType === SubmissionFormType.F4 && {
        uncertainty: replyMeter.uncertainty,
      }),
      deletedFileIds: [],
      name: (index + 1).toString(),
    };
  }

  private transformMeterToRequestMeter(meter: Meter, meterTypeId: string, formSubmissionType: SubmissionFormType): RequestMeter {
    return {
      id: meter.id ?? null,
      name: 'meter '.concat((meter.index + 1).toString()),
      tagNumber: meter.tagNumber,
      measureType: meter.measureType.value as MeasureType,
      equipmentTypeId: meterTypeId,
      equipmentSubTypeId: meter.meterType.id,
      serialNumber: meter.serialNumber,
      yearInstalled: parseInt(meter.yearInstalled.name),
      existingOrProposed: meter.existingOrProposed.value ? 0 : 1,
      mainGasMeter: meter.fiscal,
      mainGasMeterNumber: meter.fiscalPoint?.toString() || null,
      outputRangeMin: meter.outputRangeMin,
      outputRangeMax: meter.outputRangeMax,
      outputUnit: { id: meter.outputUnit.id, name: meter.outputUnit.name },
      comments: meter.comments || null,
      ...(formSubmissionType === SubmissionFormType.F4 && {
        uncertainty: meter.uncertainty,
      }),
    };
  }
}
