import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCreateRequestPrComponent } from './form-create-request-pr.component';

describe('FormCreateRequestPrComponent', () => {
  let component: FormCreateRequestPrComponent;
  let fixture: ComponentFixture<FormCreateRequestPrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormCreateRequestPrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCreateRequestPrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
