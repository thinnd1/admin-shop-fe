import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupIconSetComponent } from './group-icon-set.component';

describe('GroupIconSetComponent', () => {
  let component: GroupIconSetComponent;
  let fixture: ComponentFixture<GroupIconSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupIconSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupIconSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
