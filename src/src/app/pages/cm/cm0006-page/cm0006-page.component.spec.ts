import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cm0006PageComponent } from './cm0006-page.component';

describe('Cm0006PageComponent', () => {
  let component: Cm0006PageComponent;
  let fixture: ComponentFixture<Cm0006PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cm0006PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cm0006PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
