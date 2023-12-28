import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0012PageComponent } from './me0012-page.component';

describe('Me0012PageComponent', () => {
  let component: Me0012PageComponent;
  let fixture: ComponentFixture<Me0012PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0012PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0012PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
