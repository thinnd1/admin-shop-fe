import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0010PageComponent } from './me0010-page.component';

describe('Me0010PageComponent', () => {
  let component: Me0010PageComponent;
  let fixture: ComponentFixture<Me0010PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0010PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0010PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
