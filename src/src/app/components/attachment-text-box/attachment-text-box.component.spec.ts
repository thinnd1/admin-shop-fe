import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {AttachmentTextBoxComponent} from './attachment-text-box.component';

describe('AttachmentTextBoxComponent', () => {
  let component: AttachmentTextBoxComponent;
  let fixture: ComponentFixture<AttachmentTextBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachmentTextBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentTextBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
