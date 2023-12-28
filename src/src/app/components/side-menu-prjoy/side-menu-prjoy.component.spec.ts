import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SideMenuPrjoyComponent } from './side-menu-prjoy.component';

describe('SideMenuPrjoyComponent', () => {
  let component: SideMenuPrjoyComponent;
  let fixture: ComponentFixture<SideMenuPrjoyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SideMenuPrjoyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SideMenuPrjoyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
