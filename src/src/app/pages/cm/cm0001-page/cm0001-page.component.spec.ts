import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cm0001PageComponent } from './cm0001-page.component';

describe('Cm0001PageComponent', () => {
  let component: Cm0001PageComponent;
  let fixture: ComponentFixture<Cm0001PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cm0001PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cm0001PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
