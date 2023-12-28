import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0019PageComponent } from './me0019-page.component';

describe('Me0019PageComponent', () => {
  let component: Me0019PageComponent;
  let fixture: ComponentFixture<Me0019PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0019PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0019PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
