import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0009PageComponent } from './me0009-page.component';

describe('Me0009PageComponent', () => {
  let component: Me0009PageComponent;
  let fixture: ComponentFixture<Me0009PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0009PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0009PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
