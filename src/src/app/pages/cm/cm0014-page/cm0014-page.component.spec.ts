import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cm0014PageComponent } from './cm0014-page.component';

describe('Cm0014PageComponent', () => {
  let component: Cm0014PageComponent;
  let fixture: ComponentFixture<Cm0014PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cm0014PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cm0014PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
