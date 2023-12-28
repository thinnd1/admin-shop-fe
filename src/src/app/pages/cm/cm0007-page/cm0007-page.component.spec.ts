import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cm0007PageComponent } from './cm0007-page.component';

describe('Cm0007PageComponent', () => {
  let component: Cm0007PageComponent;
  let fixture: ComponentFixture<Cm0007PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cm0007PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cm0007PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
