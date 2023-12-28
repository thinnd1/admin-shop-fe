import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMemberListComponent } from './modal-member-list.component';

describe('ModalMemberListComponent', () => {
  let component: ModalMemberListComponent;
  let fixture: ComponentFixture<ModalMemberListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalMemberListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalMemberListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
