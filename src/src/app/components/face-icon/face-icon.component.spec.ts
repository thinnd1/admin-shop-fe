import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceIconComponent } from './face-icon.component';

describe('FaceIconComponent', () => {
  let component: FaceIconComponent;
  let fixture: ComponentFixture<FaceIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaceIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaceIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
