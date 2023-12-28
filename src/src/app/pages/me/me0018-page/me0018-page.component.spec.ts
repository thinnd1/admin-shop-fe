import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0018PageComponent } from './me0018-page.component';

describe('Me0018PageComponent', () => {
  let component: Me0018PageComponent;
  let fixture: ComponentFixture<Me0018PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0018PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0018PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
