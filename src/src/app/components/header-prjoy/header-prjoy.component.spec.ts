import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderPrjoyComponent } from './header-prjoy.component';

describe('HeaderPrjoyComponent', () => {
  let component: HeaderPrjoyComponent;
  let fixture: ComponentFixture<HeaderPrjoyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderPrjoyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderPrjoyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
