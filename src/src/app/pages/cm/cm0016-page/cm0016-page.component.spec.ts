import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cm0016PageComponent } from './cm0016-page.component';

describe('Cm0016PageComponent', () => {
  let component: Cm0016PageComponent;
  let fixture: ComponentFixture<Cm0016PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cm0016PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cm0016PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
