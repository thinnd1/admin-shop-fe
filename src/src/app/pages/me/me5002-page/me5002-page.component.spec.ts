import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me5002PageComponent } from './me5002-page.component';

describe('Me5002PageComponent', () => {
  let component: Me5002PageComponent;
  let fixture: ComponentFixture<Me5002PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me5002PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me5002PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
