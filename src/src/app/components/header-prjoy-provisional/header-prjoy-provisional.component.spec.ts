import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderPrjoyProvisionalComponent } from './header-prjoy-provisional.component';

describe('HeaderPrjoyProvisionalComponent', () => {
  let component: HeaderPrjoyProvisionalComponent;
  let fixture: ComponentFixture<HeaderPrjoyProvisionalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderPrjoyProvisionalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderPrjoyProvisionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
