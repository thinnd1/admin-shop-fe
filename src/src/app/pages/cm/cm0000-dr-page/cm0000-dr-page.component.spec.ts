import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cm0000DrPageComponent } from './cm0000-dr-page.component';

describe('Cm0000DrPageComponent', () => {
  let component: Cm0000DrPageComponent;
  let fixture: ComponentFixture<Cm0000DrPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cm0000DrPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cm0000DrPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
