import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ca0018PageComponent } from './ca0018-page.component';

describe('Ca0018PageComponent', () => {
  let component: Ca0018PageComponent;
  let fixture: ComponentFixture<Ca0018PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ca0018PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ca0018PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
