import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderDrjoyVisitorComponent } from './header-drjoy-visitor.component';

describe('HeaderDrjoyVisitorComponent', () => {
  let component: HeaderDrjoyVisitorComponent;
  let fixture: ComponentFixture<HeaderDrjoyVisitorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderDrjoyVisitorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderDrjoyVisitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
