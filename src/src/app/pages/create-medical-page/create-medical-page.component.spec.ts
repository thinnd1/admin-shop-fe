import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMedicalPageComponent } from './create-medical-page.component';

describe('CreateMedicalPageComponent', () => {
  let component: CreateMedicalPageComponent;
  let fixture: ComponentFixture<CreateMedicalPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateMedicalPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMedicalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
