import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTransferDownloadPageComponent } from './file-transfer-download-page.component';

describe('FileTransferDownloadPageComponent', () => {
  let component: FileTransferDownloadPageComponent;
  let fixture: ComponentFixture<FileTransferDownloadPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileTransferDownloadPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileTransferDownloadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
