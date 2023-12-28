import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Re0013PageComponent } from './re0013-page.component';

describe('Re0013PageComponent', () => {
  let component: Re0013PageComponent;
  let fixture: ComponentFixture<Re0013PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Re0013PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Re0013PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
