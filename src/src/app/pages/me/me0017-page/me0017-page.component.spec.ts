import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0017PageComponent } from './me0017-page.component';

describe('Me0017PageComponent', () => {
  let component: Me0017PageComponent;
  let fixture: ComponentFixture<Me0017PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0017PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0017PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
