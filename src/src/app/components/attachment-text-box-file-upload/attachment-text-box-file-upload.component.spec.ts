import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {AttachmentTextBoxFileUploadComponent} from './attachment-text-box-file-upload.component';

describe('AttachmentTextBoxFileUploadComponent', () => {
  let component: AttachmentTextBoxFileUploadComponent;
  let fixture: ComponentFixture<AttachmentTextBoxFileUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachmentTextBoxFileUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentTextBoxFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
