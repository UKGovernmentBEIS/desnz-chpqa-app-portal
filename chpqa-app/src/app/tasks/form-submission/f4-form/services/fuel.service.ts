import { Injectable } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { OptionItem } from '@shared/models/option-item.model';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { ReplyFuelCategory } from 'src/app/api-services/chpqa-api/generated';

@Injectable({
  providedIn: 'root',
})
export class FuelService {
  constructor(private chqpaApiServiceWrapper: ChqpaApiServiceWrapper) {}

  fetchFuels(): Observable<ReplyFuelCategory[]> {
    const cachedFuels = localStorage.getItem('fuels');
    if (cachedFuels) {
      return of(JSON.parse(cachedFuels));
    } else {
      return this.chqpaApiServiceWrapper.getFuelCategoriesAndFuelsService.apiGetFuelCategoriesAndFuelsGet()
        .pipe(
          tap((fuels: ReplyFuelCategory[]) => {
            localStorage.setItem('fuels', JSON.stringify(fuels));
          })
        );
    }
  }

  getFuelCategories(): Observable<OptionItem[]> {
    return this.fetchFuels().pipe(
      map(fuels =>
        fuels.map(fuel => ({
          id: fuel.id,
          name: fuel.name,
        }))
      )
    );
  }

  getFuelTypeByCategoryId(id: string): Observable<ReplyFuelCategory[]> {
    return this.fetchFuels().pipe(
      map(fuels => {
        const fuelCategory = fuels.find(fuel => fuel.id === id);
        return fuelCategory ? fuelCategory.fuelList : [];
      })
    );
  }
}
