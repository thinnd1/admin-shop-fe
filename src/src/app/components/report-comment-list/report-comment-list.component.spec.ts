import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCommentListComponent } from './report-comment-list.component';

describe('ReportCommentListComponent', () => {
  let component: ReportCommentListComponent;
  let fixture: ComponentFixture<ReportCommentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportCommentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportCommentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
