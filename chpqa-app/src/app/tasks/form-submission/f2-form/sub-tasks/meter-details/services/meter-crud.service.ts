import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Meter } from '@shared/models/form-submission.model';
import { ArrayItemState } from '@shared/models/array-item-state';

@Injectable({
  providedIn: 'root',
})
export class MeterCrudService {
  private metersSubject: BehaviorSubject<Meter[]> = new BehaviorSubject<Meter[]>([]);
  public meters$: Observable<Meter[]> = this.metersSubject.asObservable();

  addMeter(meter: Meter): { index: number; state: ArrayItemState } {
    let currentMeters = this.metersSubject.getValue();
    const newMeter = { ...meter, state: ArrayItemState.New, index: currentMeters.length, name: (currentMeters.length + 1).toString() };
    this.metersSubject.next([...currentMeters, newMeter]);
    return { index: newMeter.index, state: newMeter.state };
  }

  getMeters(): Observable<Meter[]> {
    return this.meters$;
  }

  setMeters(meters: Meter[]): void {
    this.metersSubject.next(meters);
  }

  updateMeter(meter: Meter): void {
    const updatedMeter = { ...meter, state: ArrayItemState.Touched };
    const currentMeters = this.metersSubject.getValue();
    const meterIndex = updatedMeter.index;

    if (meterIndex !== -1) {
      currentMeters[meterIndex] = updatedMeter;
      this.metersSubject.next([...currentMeters]);
    }
  }

  deleteMeter(index: number): void {
    const currentMeters = this.metersSubject.getValue();
    const updatedmeters = currentMeters.filter((_, i) => i !== index);
    this.metersSubject.next(updatedmeters);
  }

  recalculateMeterNames() {
    const meters = this.metersSubject.getValue();
    const updatedMeters = meters.map((meter, index) => ({
      ...meter,
      index: index,
      name: (index + 1).toString(),
    }));
    this.metersSubject.next(updatedMeters);
  }
}
