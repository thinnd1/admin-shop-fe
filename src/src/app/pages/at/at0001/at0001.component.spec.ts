import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { At0001Component } from './at0001.component';

describe('At0001Component', () => {
  let component: At0001Component;
  let fixture: ComponentFixture<At0001Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ At0001Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(At0001Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
