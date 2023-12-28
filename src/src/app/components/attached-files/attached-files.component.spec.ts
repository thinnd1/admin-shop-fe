import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachedFilesComponent } from './attached-files.component';

describe('AttachedFilesComponent', () => {
  let component: AttachedFilesComponent;
  let fixture: ComponentFixture<AttachedFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachedFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachedFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
