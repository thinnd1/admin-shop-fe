import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cm0013PageComponent } from './cm0013-page.component';

describe('Cm0013PageComponent', () => {
  let component: Cm0013PageComponent;
  let fixture: ComponentFixture<Cm0013PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cm0013PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cm0013PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
