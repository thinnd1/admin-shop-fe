import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0020PageComponent } from './me0020-page.component';

describe('Me0020PageComponent', () => {
  let component: Me0020PageComponent;
  let fixture: ComponentFixture<Me0020PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0020PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0020PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
