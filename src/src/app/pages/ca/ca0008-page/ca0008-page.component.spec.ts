import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ca0008PageComponent } from './ca0008-page.component';

describe('Ca0008PageComponent', () => {
  let component: Ca0008PageComponent;
  let fixture: ComponentFixture<Ca0008PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ca0008PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ca0008PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
