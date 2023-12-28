import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0016PageComponent } from './me0016-page.component';

describe('Me0016PageComponent', () => {
  let component: Me0016PageComponent;
  let fixture: ComponentFixture<Me0016PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0016PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0016PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
