import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInputCustomComponent } from './modal-input-custom.component';

describe('ModalInputCustomComponent', () => {
  let component: ModalInputCustomComponent;
  let fixture: ComponentFixture<ModalInputCustomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInputCustomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
