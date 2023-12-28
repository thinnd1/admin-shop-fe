import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ca0006PageComponent } from './ca0006-page.component';

describe('Ca0006PageComponent', () => {
  let component: Ca0006PageComponent;
  let fixture: ComponentFixture<Ca0006PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ca0006PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ca0006PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
