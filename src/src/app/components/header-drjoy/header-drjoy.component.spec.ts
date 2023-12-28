import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderDrjoyComponent } from './header-drjoy.component';

describe('HeaderDrjoyComponent', () => {
  let component: HeaderDrjoyComponent;
  let fixture: ComponentFixture<HeaderDrjoyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderDrjoyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderDrjoyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
