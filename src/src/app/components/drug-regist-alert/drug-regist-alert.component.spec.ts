import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugRegistAlertComponent } from './drug-regist-alert.component';

describe('DrugRegistAlertComponent', () => {
  let component: DrugRegistAlertComponent;
  let fixture: ComponentFixture<DrugRegistAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrugRegistAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrugRegistAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
