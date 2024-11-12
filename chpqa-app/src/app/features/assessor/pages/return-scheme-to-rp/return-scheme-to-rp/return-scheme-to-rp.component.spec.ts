import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnSchemeToRpComponent } from './return-scheme-to-rp.component';

describe('ReturnSchemeToRpComponent', () => {
  let component: ReturnSchemeToRpComponent;
  let fixture: ComponentFixture<ReturnSchemeToRpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnSchemeToRpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReturnSchemeToRpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
