import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInputValidateComponent } from './modal-input-validate.component';

describe('ModalInputValidateComponent', () => {
  let component: ModalInputValidateComponent;
  let fixture: ComponentFixture<ModalInputValidateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInputValidateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputValidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
