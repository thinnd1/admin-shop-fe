import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ca0009PageComponent } from './ca0009-page.component';

describe('Ca0009PageComponent', () => {
  let component: Ca0009PageComponent;
  let fixture: ComponentFixture<Ca0009PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ca0009PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ca0009PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
