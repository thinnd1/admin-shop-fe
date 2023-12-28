import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCreateRequestDrComponent } from './form-create-request-dr.component';

describe('FormCreateRequestDrComponent', () => {
  let component: FormCreateRequestDrComponent;
  let fixture: ComponentFixture<FormCreateRequestDrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormCreateRequestDrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCreateRequestDrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
