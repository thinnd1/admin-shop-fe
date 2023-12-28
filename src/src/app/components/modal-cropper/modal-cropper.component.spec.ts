import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCropperComponent } from './modal-cropper.component';

describe('ModalCropperComponent', () => {
  let component: ModalCropperComponent;
  let fixture: ComponentFixture<ModalCropperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCropperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCropperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
