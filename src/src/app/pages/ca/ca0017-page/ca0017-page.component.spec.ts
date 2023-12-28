import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ca0017PageComponent } from './ca0017-page.component';

describe('Ca0018PageComponent', () => {
  let component: Ca0017PageComponent;
  let fixture: ComponentFixture<Ca0017PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ca0017PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ca0017PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
