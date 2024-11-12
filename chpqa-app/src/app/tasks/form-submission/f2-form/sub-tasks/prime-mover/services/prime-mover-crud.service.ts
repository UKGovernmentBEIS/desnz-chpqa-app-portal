import { Injectable } from '@angular/core';
import { ArrayItemState } from '@shared/models/array-item-state';
import { PrimeMover } from '@shared/models/form-submission.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrimeMoverCrudService {
  private primeMoversSubject: BehaviorSubject<PrimeMover[]> = new BehaviorSubject<PrimeMover[]>([]);
  public primeMovers$: Observable<PrimeMover[]> = this.primeMoversSubject.asObservable();

  addPrimeMover(primeMover: PrimeMover): { index: number, state: ArrayItemState } {
    const currentPrimeMovers = this.primeMoversSubject.getValue();
    const newPrimeMover = { ...primeMover, state: ArrayItemState.New, index: currentPrimeMovers.length, name: (currentPrimeMovers.length +1).toString() };
    this.primeMoversSubject.next([...currentPrimeMovers, newPrimeMover]);
    return { index: newPrimeMover.index, state: newPrimeMover.state };
  }

  setPrimeMovers(primeMovers: PrimeMover[]): void {
    this.primeMoversSubject.next(primeMovers);
  }
  
  getPrimeMovers(): Observable<PrimeMover[]> {
    return this.primeMovers$;
  }

  updatePrimeMover(primemover: PrimeMover): void {
    const updatedPrimeMover = {...primemover, state: ArrayItemState.Touched};
    const currentPrimeMovers = this.primeMoversSubject.getValue();
    const primemoverIndex = updatedPrimeMover.index; 

    if (primemoverIndex !== -1) {
      currentPrimeMovers[primemoverIndex] = updatedPrimeMover;
      this.primeMoversSubject.next([...currentPrimeMovers]);
    }
  }

  deletePrimeMover(index: number): void {
    const currentPrimeMovers = this.primeMoversSubject.getValue();
    const updatedPrimeMovers = currentPrimeMovers.filter((_, i) => i !== index);
    this.primeMoversSubject.next(updatedPrimeMovers);
  }

  recalculatePrimeMoverNames() {
    const primeMovers = this.primeMoversSubject.getValue();
    const updatedPrimeMovers = primeMovers.map((primeMover, index) => ({
      ...primeMover,
      index: index,
      name: (index + 1).toString(), 
    }));
    this.primeMoversSubject.next(updatedPrimeMovers);
  }
}
