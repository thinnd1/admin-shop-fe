import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { At0006Component } from './at0006.component';

describe('At0006Component', () => {
  let component: At0006Component;
  let fixture: ComponentFixture<At0006Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ At0006Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(At0006Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
