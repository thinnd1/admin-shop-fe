import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFilePreviewComponent } from './modal-file-preview.component';

describe('ModalFilePreviewComponent', () => {
  let component: ModalFilePreviewComponent;
  let fixture: ComponentFixture<ModalFilePreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalFilePreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFilePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
