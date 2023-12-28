import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0049PageComponent } from './me0049-page.component';

describe('Me0049PageComponent', () => {
  let component: Me0049PageComponent;
  let fixture: ComponentFixture<Me0049PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0049PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0049PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
