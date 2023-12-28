import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderPrjoyVisitorComponent } from './header-prjoy-visitor.component';

describe('HeaderPrjoyVisitorComponent', () => {
  let component: HeaderPrjoyVisitorComponent;
  let fixture: ComponentFixture<HeaderPrjoyVisitorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderPrjoyVisitorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderPrjoyVisitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
