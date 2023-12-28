import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberListAllComponent } from './member-list-all.component';

describe('MemberListAllComponent', () => {
  let component: MemberListAllComponent;
  let fixture: ComponentFixture<MemberListAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberListAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberListAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
