import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberSelectComponent } from './member-select.component';

describe('MemberSelectComponent', () => {
  let component: MemberSelectComponent;
  let fixture: ComponentFixture<MemberSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
