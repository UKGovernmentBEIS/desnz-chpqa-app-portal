import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterResponsiblePersonFormComponent } from './enter-responsible-person-form.component';

describe('EnterDetailsFormComponent', () => {
  let component: EnterResponsiblePersonFormComponent;
  let fixture: ComponentFixture<EnterResponsiblePersonFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterResponsiblePersonFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EnterResponsiblePersonFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
