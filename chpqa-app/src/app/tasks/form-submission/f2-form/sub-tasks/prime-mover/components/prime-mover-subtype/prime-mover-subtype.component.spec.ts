import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeMoverSubtypeComponent } from './prime-mover-subtype.component';

describe('PrimeMoverSubtypeComponent', () => {
  let component: PrimeMoverSubtypeComponent;
  let fixture: ComponentFixture<PrimeMoverSubtypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeMoverSubtypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrimeMoverSubtypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
