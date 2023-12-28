import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me5008PageComponent } from './me5008-page.component';

describe('Me5008PageComponent', () => {
  let component: Me5008PageComponent;
  let fixture: ComponentFixture<Me5008PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me5008PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me5008PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
