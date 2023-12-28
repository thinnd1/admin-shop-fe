import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cm0017DrPageComponent } from './cm0017-dr-page.component';

describe('Cm0017DrPageComponent', () => {
  let component: Cm0017DrPageComponent;
  let fixture: ComponentFixture<Cm0017DrPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cm0017DrPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cm0017DrPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
