import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsPanelDrComponent } from './settings-panel-dr.component';

describe('SettingsPanelDrComponent', () => {
  let component: SettingsPanelDrComponent;
  let fixture: ComponentFixture<SettingsPanelDrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsPanelDrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsPanelDrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
