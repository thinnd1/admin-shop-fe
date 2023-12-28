import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cm0000PrPageComponent } from './cm0000-pr-page.component';

describe('Cm0000PrPageComponent', () => {
  let component: Cm0000PrPageComponent;
  let fixture: ComponentFixture<Cm0000PrPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cm0000PrPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cm0000PrPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
