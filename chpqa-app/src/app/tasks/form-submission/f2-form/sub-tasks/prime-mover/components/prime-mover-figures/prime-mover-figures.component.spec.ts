import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeMoverFiguresComponent } from './prime-mover-figures.component';

describe('PrimeMoverFiguresComponent', () => {
  let component: PrimeMoverFiguresComponent;
  let fixture: ComponentFixture<PrimeMoverFiguresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeMoverFiguresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrimeMoverFiguresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
