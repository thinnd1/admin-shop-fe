import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cm0002PageComponent } from './cm0002-page.component';

describe('Cm0002PageComponent', () => {
  let component: Cm0002PageComponent;
  let fixture: ComponentFixture<Cm0002PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cm0002PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cm0002PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
