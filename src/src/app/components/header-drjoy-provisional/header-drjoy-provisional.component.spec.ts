import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderDrjoyProvisionalComponent } from './header-drjoy-provisional.component';

describe('HeaderDrjoyProvisionalComponent', () => {
  let component: HeaderDrjoyProvisionalComponent;
  let fixture: ComponentFixture<HeaderDrjoyProvisionalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderDrjoyProvisionalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderDrjoyProvisionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
