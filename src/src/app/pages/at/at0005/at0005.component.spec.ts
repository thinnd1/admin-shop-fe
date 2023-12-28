import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { At0005Component } from './at0005.component';

describe('At0005Component', () => {
  let component: At0005Component;
  let fixture: ComponentFixture<At0005Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ At0005Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(At0005Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
