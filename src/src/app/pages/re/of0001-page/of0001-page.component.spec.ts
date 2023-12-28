import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Of0001PageComponent } from './of0001-page.component';

describe('Of0001PageComponent', () => {
  let component: Of0001PageComponent;
  let fixture: ComponentFixture<Of0001PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Of0001PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Of0001PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
