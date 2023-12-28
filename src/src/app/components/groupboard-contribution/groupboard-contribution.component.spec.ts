import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupboardContributionComponent } from './groupboard-contribution.component';

describe('GroupboardContributionComponent', () => {
  let component: GroupboardContributionComponent;
  let fixture: ComponentFixture<GroupboardContributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupboardContributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupboardContributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
