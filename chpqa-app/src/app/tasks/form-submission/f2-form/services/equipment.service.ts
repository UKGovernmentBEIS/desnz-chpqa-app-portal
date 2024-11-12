import { Injectable } from '@angular/core';
import { OptionItem } from '@shared/models/option-item.model';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';

import { SubmissionFormType } from '@shared/enums/form-submission.enum';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { EquipmentSubType, EquipmentType } from 'src/app/api-services/chpqa-api/generated';

@Injectable({
  providedIn: 'root',
})
export class EquipmentService {
  private subtypesSubject = new BehaviorSubject<OptionItem[]>([]);
  subtypes$ = this.subtypesSubject.asObservable();

  constructor(private chqpaApiServiceWrapper: ChqpaApiServiceWrapper) {}
  fetchAllTypes(): Observable<EquipmentType[]> {
    const cachedTypes = localStorage.getItem('types');
    if (cachedTypes) {
      return of(JSON.parse(cachedTypes) as EquipmentType[]);
    } else {
      return this.chqpaApiServiceWrapper.getEquipmentTypesAndSubTypesService.apiGetEquipmentTypesAndSubTypesGet().pipe(
        tap((types: EquipmentType[]) => {
          if (types) {
            localStorage.setItem('types', JSON.stringify(types));
          }
        })
      );
    }
  }

  getTypesFor(submissionFormType: SubmissionFormType): Observable<OptionItem[]> {
    return this.fetchAllTypes().pipe(
      map(types => {
        types = this.filterTypesBySubmissionFormType(types, submissionFormType);

        return types
          .filter(type => type.prefix !== 'M') // exclude meter types
          .map(type => ({ id: type.id, name: type.name }));
      })
    );
  }

  private filterTypesBySubmissionFormType(types: EquipmentType[], submissionFormType: SubmissionFormType) {
    let filteredTypes: EquipmentType[] = types;

    if (submissionFormType === SubmissionFormType.F3 || submissionFormType === SubmissionFormType.F4s) {
      filteredTypes = filteredTypes.filter(type => type.prefix === 'RE');
    }

    return filteredTypes;
  }

  fetchSubtypesFor(typeId: string, submissionFormType: SubmissionFormType): Observable<OptionItem[]> {
    return this.fetchAllTypes().pipe(
      map(types => {
        const selectedType = types.find(type => type.id === typeId);

        if (selectedType) {
          const subTypes = this.filterSubTypesBySubmissionFormType(selectedType, submissionFormType);

          return subTypes.map(subtype => ({
            id: subtype.id,
            name: subtype.name,
          }));
        }

        return [];
      })
    );
  }

  private filterSubTypesBySubmissionFormType(parentType: EquipmentType, submissionFormType: SubmissionFormType) {
    let filteredSubTypes: EquipmentSubType[] = parentType.equipmentSubTypeList;

    if (submissionFormType === SubmissionFormType.F3 || submissionFormType === SubmissionFormType.F4s) {
      filteredSubTypes = filteredSubTypes.filter(subType => subType.suffix === '(G)');
    }

    return filteredSubTypes;
  }

  setSubTypes(subtypes: OptionItem[]): void {
    this.subtypesSubject.next(subtypes);
  }

  getSubTypes$(): Observable<OptionItem[]> {
    return this.subtypes$;
  }

  getMeterTypes(): Observable<OptionItem[]> {
    return this.fetchAllTypes().pipe(
      map(types => {
        const selectedType = types.find(type => type.prefix === 'M');
        return selectedType
          ? selectedType.equipmentSubTypeList.map(subtype => ({
              id: subtype.id,
              name: subtype.name,
            }))
          : [];
      })
    );
  }

  getMeterTypeId(): Observable<string> {
    return this.fetchAllTypes().pipe(
      map(types => {
        const selectedType = types.find(type => type.prefix === 'M');
        return selectedType?.id || null;
      })
    );
  }

  getMeterFlowTypeId(): Observable<string> {
    return this.fetchAllTypes().pipe(
      map(types => {
        const selectedType = types.find(type => type.prefix === 'M');
        return selectedType.equipmentSubTypeList.find(subType => subType.suffix === '(F) / (Fc)').id;
      })
    );
  }
}
