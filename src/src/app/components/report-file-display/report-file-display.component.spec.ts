import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFileDisplayComponent } from './report-file-display.component';

describe('ReportFileDisplayComponent', () => {
  let component: ReportFileDisplayComponent;
  let fixture: ComponentFixture<ReportFileDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportFileDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportFileDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
