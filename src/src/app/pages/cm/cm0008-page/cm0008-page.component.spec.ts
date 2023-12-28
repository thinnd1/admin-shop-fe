import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cm0008PageComponent } from './cm0008-page.component';

describe('Cm0008PageComponent', () => {
  let component: Cm0008PageComponent;
  let fixture: ComponentFixture<Cm0008PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cm0008PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cm0008PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
