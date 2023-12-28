import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAttachedComponent } from './modal-attached.component';

describe('ModalAttachedComponent', () => {
  let component: ModalAttachedComponent;
  let fixture: ComponentFixture<ModalAttachedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAttachedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAttachedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
