import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0029PageComponent } from './me0029-page.component';

describe('Me0029PageComponent', () => {
  let component: Me0029PageComponent;
  let fixture: ComponentFixture<Me0029PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0029PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0029PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
