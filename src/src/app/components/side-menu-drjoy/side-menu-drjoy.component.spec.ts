import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SideMenuDrjoyComponent } from './side-menu-drjoy.component';

describe('SideMenuDrjoyComponent', () => {
  let component: SideMenuDrjoyComponent;
  let fixture: ComponentFixture<SideMenuDrjoyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SideMenuDrjoyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SideMenuDrjoyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
