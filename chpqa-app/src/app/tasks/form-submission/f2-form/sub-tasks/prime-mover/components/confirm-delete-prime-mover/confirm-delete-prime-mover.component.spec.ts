import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeletePrimeMoverComponent } from './confirm-delete-prime-mover.component';

describe('ConfirmDeletePrimeMoverComponent', () => {
  let component: ConfirmDeletePrimeMoverComponent;
  let fixture: ComponentFixture<ConfirmDeletePrimeMoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDeletePrimeMoverComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmDeletePrimeMoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
