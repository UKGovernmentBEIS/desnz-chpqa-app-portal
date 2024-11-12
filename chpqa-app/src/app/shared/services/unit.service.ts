import { Injectable } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { Engine, Manufacturer, Model, Unit } from '@shared/models/unit.model';
import { OptionItem } from '@shared/models/option-item.model';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { RequestCreateManufactModelEngineUnit } from 'src/app/api-services/chpqa-api/generated';

@Injectable({
  providedIn: 'root',
})
export class UnitService {
  constructor(private chqpaApiServiceWrapper: ChqpaApiServiceWrapper) {}

  fetchAllUnits(): Observable<Unit[]> {
    const cachedUnits = localStorage.getItem('units');
    if (cachedUnits) {
      return of(JSON.parse(cachedUnits));
    } else {
      return this.chqpaApiServiceWrapper.getUnitsService.apiGetAllUnitsGet().pipe(
        tap((response: any) => {
          // Hack the backend still returns an array but the interface in swagger is wrong
          const units = Array.isArray(response) ? response : [response];
          localStorage.setItem('units', JSON.stringify(units));
        })
      );
    }
  }

  createUnit(customUnit: RequestCreateManufactModelEngineUnit) {
    localStorage.removeItem('units');
    return this.chqpaApiServiceWrapper.createManufactModelEngineUnitService
      .apiSecureCreateManufactModelEngineUnitPost(customUnit);
  }

  private filterUnique<T>(units: Unit[], keySelector: (unit: Unit) => T): T[] {
    const itemSet = new Set<string>();
    const uniqueItems: T[] = [];

    units.forEach(unit => {
      const item = keySelector(unit);
      const { id, name } = item as unknown as OptionItem;
      if (!itemSet.has(name)) {
        itemSet.add(name);
        uniqueItems.push(item);
      }
    });

    return uniqueItems;
  }

  getModels(manufacturerId: string): Observable<Model[]> {
    return this.fetchAllUnits().pipe(
      map(units =>
        units.filter(unit => unit.manufacturer?.id === manufacturerId)
      ),
      map(units => this.filterUnique(units, unit => unit.model))
    );
  }

  getManufacturers(): Observable<Manufacturer[]> {
    return this.fetchAllUnits().pipe(
      map(units => this.filterUnique(units, unit => unit.manufacturer))
    );
  }

  getEngines(modelId: string): Observable<Engine[]> {
    return this.fetchAllUnits().pipe(
      map(units => units.filter(unit => unit.model?.id === modelId)),
      map(units =>
        units.map(unit => ({
          ...unit.engine,
          id: unit.id,
        }))
      )
    );
  }

  getUnitById(id: string): Observable<Unit> {
    return this.fetchAllUnits().pipe(
      map(units => units.find(unit => unit.id === id))
    );
  }
}
