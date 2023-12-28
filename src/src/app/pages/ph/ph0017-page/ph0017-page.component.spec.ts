import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ph0017PageComponent } from './ph0017-page.component';

describe('Ph0017PageComponent', () => {
  let component: Ph0017PageComponent;
  let fixture: ComponentFixture<Ph0017PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ph0017PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ph0017PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
