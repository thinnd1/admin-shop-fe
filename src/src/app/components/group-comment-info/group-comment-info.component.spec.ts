import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCommentInfoComponent } from './group-comment-info.component';

describe('GroupCommentInfoComponent', () => {
  let component: GroupCommentInfoComponent;
  let fixture: ComponentFixture<GroupCommentInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupCommentInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupCommentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
