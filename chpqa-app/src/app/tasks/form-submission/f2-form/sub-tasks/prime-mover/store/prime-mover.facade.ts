import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { PrimeMoverCrudService } from '../services/prime-mover-crud.service';
import { PrimeMoverService } from '../services/prime-mover.service';
import { PrimeMover } from '@shared/models/form-submission.model';
import { selectSubmissionFormId } from '@shared/store';
import { Observable, withLatestFrom, map, switchMap, tap, BehaviorSubject, catchError, of } from 'rxjs';
import { mapFiles, mapToOptionItem, mapToRadioButtonOption } from '@shared/utils/data-transform-utils';
import { ReplyEquipment, RequestEquipment, RequestUpdateSubmissionEquipmentList } from 'src/app/api-services/chpqa-api/generated';
import { ArrayItemState } from '@shared/models/array-item-state';
import { setPrimeMoverState } from './prime-mover.actions';

@Injectable({
  providedIn: 'root',
})
export class PrimeMoverFacade {
  private isSubmittingPrimeMoverSubject = new BehaviorSubject<boolean>(false);
  isSubmittingPrimeMovers$ = this.isSubmittingPrimeMoverSubject.asObservable();
  
  private showDeleteSuccessBannerSubject = new BehaviorSubject<boolean>(false);
  showDeleteSuccessBanner$ = this.showDeleteSuccessBannerSubject.asObservable();

  constructor(
    private store: Store,
    private primeMoverService: PrimeMoverService,
    private primemoverCrudService: PrimeMoverCrudService
  ) {}

  get primeMovers$(): Observable<PrimeMover[]> {
    return this.primemoverCrudService.primeMovers$;
  }

  submitPrimeMovers$(): Observable<any> {
    return this.primemoverCrudService.primeMovers$.pipe(
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([primeMovers, submissionId]) => {
        const transformedPrimeMovers = primeMovers
          .filter(primeMover => primeMover.state === ArrayItemState.New || primeMover.state === ArrayItemState.Touched)
          .map((primeMover, index) => this.transformPrimeMoverToRequestEquipment(primeMover));
        return {
          idSubmission: submissionId,
          equipmentList: transformedPrimeMovers,
        } as RequestUpdateSubmissionEquipmentList;
      }),
      switchMap(primeMoverSubmissionRequest => this.primeMoverService.submitPrimeMovers(primeMoverSubmissionRequest))
    );
  }

  fetchPrimeMovers(submissionId: string): Observable<PrimeMover[]> {
    return this.primeMoverService.fetchPrimeMovers(submissionId).pipe(
      map(replyPrimeMovers => replyPrimeMovers.map((replyPrimeMover, index) => this.transformReplyEquipmentToPrimeMover(replyPrimeMover, index))),
      tap(transformedPrimeMovers => this.setPrimeMovers(transformedPrimeMovers))
    );
  }

  addPrimeMover(primeMover: PrimeMover): void {
    const { index, state} = this.primemoverCrudService.addPrimeMover(primeMover);
    this.store.dispatch(setPrimeMoverState({arrayItemState: state, index} ));
  }

  updatePrimeMover(primeMover: PrimeMover): void {
    this.primemoverCrudService.updatePrimeMover(primeMover);
  }

  deletePrimeMover(submissionId: string, index: number, primeMoverIdToDelete: string | null) {
    if (primeMoverIdToDelete) {
      return this.primeMoverService.deletePrimeMover(submissionId, primeMoverIdToDelete).pipe(
        tap(() => this.primemoverCrudService.deletePrimeMover(index)),
        catchError((error) => {
          console.error('Error deleting prime mover from server:', error);
          return of(null);
        })
      )
    } else {
      this.primemoverCrudService.deletePrimeMover(index);
      return of(null);
    }
  }

  setPrimeMovers(primeMovers: PrimeMover[]): void {
    this.primemoverCrudService.setPrimeMovers(primeMovers);
  }

  resetPrimeMovers(): void {
    this.primemoverCrudService.setPrimeMovers([]);
  }

  downloadFilePrimeMover(submissionId: string, fileId: string) {
    return this.primeMoverService.downloadPrimeMoverFile(submissionId, fileId)
  }

  setSubmittingPrimeMoversSubject(value: boolean): void {
    this.isSubmittingPrimeMoverSubject.next(value);
  }

  resetSubmittingPrimeMoversState(): void {
    this.resetPrimeMovers();
    this.setSubmittingPrimeMoversSubject(false);
    this.hideDeleteSuccessBanner();
  }

  showDeleteSuccessBanner(): void {
    this.showDeleteSuccessBannerSubject.next(true);
  }

  hideDeleteSuccessBanner(): void {
    if (this.showDeleteSuccessBannerSubject.getValue() === true) {
      this.primemoverCrudService.recalculatePrimeMoverNames();
    }
    this.showDeleteSuccessBannerSubject.next(false);
  }

  private transformReplyEquipmentToPrimeMover(replyEquipment: ReplyEquipment, index: number): PrimeMover {
    return {
      id: replyEquipment.id || null,
      tagNumber: replyEquipment.tagNumber || '',
      yearCommissioned: mapToOptionItem(replyEquipment.yearCommissioned),
      engineType: { id: replyEquipment.equipmentType.id, name: replyEquipment.equipmentType.name },
      engineSubtype: { id: replyEquipment.equipmentSubType.id, name: replyEquipment.equipmentSubType.name },
      mechanicalLoad: mapToRadioButtonOption(replyEquipment.mechanicalLoad),
      manufacturer: { id: replyEquipment.unit.manufacturer.id, name: replyEquipment.unit.manufacturer.name },
      model: { id: replyEquipment.unit.model.id, name: replyEquipment.unit.model.name },
      engineName: { id: replyEquipment.unit.id, name: replyEquipment.unit.engine.name },
      totalHeatOutputKw: replyEquipment.unit.totalHeatCapacityKw || 0,
      totalPowerCapacityKw: replyEquipment.unit.totalPowerCapacityKw || 0,
      fuelInputKw: replyEquipment.unit.fuelInputKw || 0,
      powerEfficiency: replyEquipment.unit.powerEfficiency || 0,
      maxHeatToPowerRatio: replyEquipment.unit.maxHeatToPowerRatio || 0,
      maxHeatEfficiency: replyEquipment.unit.maxHeatEfficiency || 0,
      maxOverallEfficiency: replyEquipment.unit.maxOverallEfficiency || 0,
      comments: replyEquipment.comments || null,
      files: replyEquipment.equipmentFilesList ? mapFiles(replyEquipment.equipmentFilesList) : [],
      customUnit: false,
      state: ArrayItemState.Unchanged,
      index: index,
      deletedFileIds: [],
      name: (index+1).toString()
    };
  }

  private transformPrimeMoverToRequestEquipment(primeMover: PrimeMover): RequestEquipment {
    return {
      id: primeMover.id ?? null,
      name: 'prime mover '.concat((primeMover.index + 1).toString()),
      tagNumber: primeMover.tagNumber,
      yearCommissioned: parseInt(primeMover.yearCommissioned.name),
      equipmentTypeId: primeMover.engineType?.id ? (primeMover.engineType.id !== '' ? primeMover.engineType.id : null) : null,
      equipmentSubTypeId: primeMover.engineSubtype?.id ? (primeMover.engineSubtype.id !== '' ? primeMover.engineSubtype.id : null) : null,
      mechanicalLoad: primeMover.mechanicalLoad.value as boolean,
      manufacturerId: primeMover.manufacturer.id,
      modelId: primeMover.model.id,
      engineUnitId: primeMover.engineName?.id,
      comments: primeMover.comments,
    };
  }
}
