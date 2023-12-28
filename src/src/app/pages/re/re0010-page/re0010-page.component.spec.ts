import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Re0010PageComponent } from './re0010-page.component';

describe('Re0010PageComponent', () => {
  let component: Re0010PageComponent;
  let fixture: ComponentFixture<Re0010PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Re0010PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Re0010PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
