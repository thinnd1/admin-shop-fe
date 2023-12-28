import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberSelectCopyComponent } from './member-select-copy.component';

describe('MemberSelectCopyComponent', () => {
  let component: MemberSelectCopyComponent;
  let fixture: ComponentFixture<MemberSelectCopyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberSelectCopyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberSelectCopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
