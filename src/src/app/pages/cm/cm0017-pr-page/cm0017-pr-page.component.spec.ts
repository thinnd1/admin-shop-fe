import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cm0017PrPageComponent } from './cm0017-pr-page.component';

describe('Cm0017PrPageComponent', () => {
  let component: Cm0017PrPageComponent;
  let fixture: ComponentFixture<Cm0017PrPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cm0017PrPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cm0017PrPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
