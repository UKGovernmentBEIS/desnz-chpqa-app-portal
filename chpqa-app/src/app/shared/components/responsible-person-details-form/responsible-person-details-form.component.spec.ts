import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsiblePersonFormComponent } from './responsible-person-details-form.component';

describe('DetailsFormComponent', () => {
  let component: ResponsiblePersonFormComponent;
  let fixture: ComponentFixture<DetailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
