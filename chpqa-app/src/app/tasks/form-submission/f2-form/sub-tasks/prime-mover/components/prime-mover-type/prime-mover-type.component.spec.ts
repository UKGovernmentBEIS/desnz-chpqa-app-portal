import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeMoverSelectTypeComponent } from './prime-mover-type.component';

describe('PrimeMoverSelectTypeComponent', () => {
  let component: PrimeMoverSelectTypeComponent;
  let fixture: ComponentFixture<PrimeMoverSelectTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeMoverSelectTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrimeMoverSelectTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
