import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cm0012PageComponent } from './cm0012-page.component';

describe('Cm0012PageComponent', () => {
  let component: Cm0012PageComponent;
  let fixture: ComponentFixture<Cm0012PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cm0012PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cm0012PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
