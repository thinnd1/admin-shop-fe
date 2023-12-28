import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Re0006PageComponent } from './re0006-page.component';

describe('Re0006PageComponent', () => {
  let component: Re0006PageComponent;
  let fixture: ComponentFixture<Re0006PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Re0006PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Re0006PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
