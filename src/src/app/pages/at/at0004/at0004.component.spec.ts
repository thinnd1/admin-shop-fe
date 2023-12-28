import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { At0004Component } from './at0004.component';

describe('At0004Component', () => {
  let component: At0004Component;
  let fixture: ComponentFixture<At0004Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ At0004Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(At0004Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
