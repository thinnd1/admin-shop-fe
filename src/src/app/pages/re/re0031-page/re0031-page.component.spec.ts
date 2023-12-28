import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Re0031PageComponent } from './re0031-page.component';

describe('Re0031PageComponent', () => {
  let component: Re0031PageComponent;
  let fixture: ComponentFixture<Re0031PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Re0031PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Re0031PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
