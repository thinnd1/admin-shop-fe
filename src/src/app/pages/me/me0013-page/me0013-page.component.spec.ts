import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0013PageComponent } from './me0013-page.component';

describe('Me0013PageComponent', () => {
  let component: Me0013PageComponent;
  let fixture: ComponentFixture<Me0013PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0013PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0013PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
