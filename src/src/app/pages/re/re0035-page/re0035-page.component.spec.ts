import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RE0035PageComponent } from './re0035-page.component';

describe('RE0035PageComponent', () => {
  let component: RE0035PageComponent;
  let fixture: ComponentFixture<RE0035PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RE0035PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RE0035PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
