import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPrimeMoverComponent } from './add-prime-mover.component';

describe('AddPrimeMoverComponent', () => {
  let component: AddPrimeMoverComponent;
  let fixture: ComponentFixture<AddPrimeMoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPrimeMoverComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPrimeMoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
