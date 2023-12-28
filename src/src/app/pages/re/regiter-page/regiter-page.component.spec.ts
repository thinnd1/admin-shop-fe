import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegiterPageComponent } from './regiter-page.component';

describe('RegiterPageComponent', () => {
  let component: RegiterPageComponent;
  let fixture: ComponentFixture<RegiterPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegiterPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegiterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
