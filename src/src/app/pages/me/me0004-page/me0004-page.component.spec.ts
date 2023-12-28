import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0004PageComponent } from './me0004-page.component';

describe('Me0004PageComponent', () => {
  let component: Me0004PageComponent;
  let fixture: ComponentFixture<Me0004PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0004PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0004PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
