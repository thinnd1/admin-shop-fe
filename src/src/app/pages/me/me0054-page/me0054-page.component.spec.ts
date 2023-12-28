import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0054PageComponent } from './me0054-page.component';

describe('Me0054PageComponent', () => {
  let component: Me0054PageComponent;
  let fixture: ComponentFixture<Me0054PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0054PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0054PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
