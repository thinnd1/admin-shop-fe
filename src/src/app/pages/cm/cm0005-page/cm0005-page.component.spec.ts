import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cm0005PageComponent } from './cm0005-page.component';

describe('Cm0005PageComponent', () => {
  let component: Cm0005PageComponent;
  let fixture: ComponentFixture<Cm0005PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cm0005PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cm0005PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
