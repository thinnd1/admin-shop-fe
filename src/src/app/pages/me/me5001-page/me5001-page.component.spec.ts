import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me5001PageComponent } from './me5001-page.component';

describe('ME5001PageComponent', () => {
  let component: Me5001PageComponent;
  let fixture: ComponentFixture<Me5001PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me5001PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me5001PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
