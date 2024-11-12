import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatHappensNextComponent } from './what-happens-next.component';

describe('WhatHappensNextComponent', () => {
  let component: WhatHappensNextComponent;
  let fixture: ComponentFixture<WhatHappensNextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatHappensNextComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhatHappensNextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
