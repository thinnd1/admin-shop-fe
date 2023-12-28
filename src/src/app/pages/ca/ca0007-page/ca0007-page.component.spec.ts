import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ca0007PageComponent } from './ca0007-page.component';

describe('Ca0007PageComponent', () => {
  let component: Ca0007PageComponent;
  let fixture: ComponentFixture<Ca0007PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ca0007PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ca0007PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
