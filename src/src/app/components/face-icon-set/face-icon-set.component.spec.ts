import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceIconSetComponent } from './face-icon-set.component';

describe('FaceIconSetComponent', () => {
  let component: FaceIconSetComponent;
  let fixture: ComponentFixture<FaceIconSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaceIconSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaceIconSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
