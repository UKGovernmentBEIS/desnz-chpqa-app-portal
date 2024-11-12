import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterExistenceComponent } from './meter-existence.component';

describe('MeterExistenceComponent', () => {
  let component: MeterExistenceComponent;
  let fixture: ComponentFixture<MeterExistenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeterExistenceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeterExistenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
