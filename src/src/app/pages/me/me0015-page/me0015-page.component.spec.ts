import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0015PageComponent } from './me0015-page.component';

describe('Me0015PageComponent', () => {
  let component: Me0015PageComponent;
  let fixture: ComponentFixture<Me0015PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0015PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0015PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
