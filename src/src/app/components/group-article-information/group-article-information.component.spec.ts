import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupArticleInformationComponent } from './group-article-information.component';

describe('GroupArticleInformationComponent', () => {
  let component: GroupArticleInformationComponent;
  let fixture: ComponentFixture<GroupArticleInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupArticleInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupArticleInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
