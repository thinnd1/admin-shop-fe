import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {AttachmentTextBoxContentsComponent} from './attachment-text-box-contents.component';

describe('AttachmentTextBoxContentsComponent', () => {
  let component: AttachmentTextBoxContentsComponent;
  let fixture: ComponentFixture<AttachmentTextBoxContentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachmentTextBoxContentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentTextBoxContentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
