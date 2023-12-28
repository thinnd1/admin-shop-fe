import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsPanelPrComponent } from './settings-panel-pr.component';

describe('SettingsPanelPrComponent', () => {
  let component: SettingsPanelPrComponent;
  let fixture: ComponentFixture<SettingsPanelPrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsPanelPrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsPanelPrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
