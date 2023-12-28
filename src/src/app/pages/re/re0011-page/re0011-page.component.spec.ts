import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Re0011PageComponent } from './re0011-page.component';

describe('Re0011PageComponent', () => {
  let component: Re0011PageComponent;
  let fixture: ComponentFixture<Re0011PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Re0011PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Re0011PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
