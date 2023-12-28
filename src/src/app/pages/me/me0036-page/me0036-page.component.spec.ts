import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0036PageComponent } from './me0036-page.component';

describe('Me0036PageComponent', () => {
  let component: Me0036PageComponent;
  let fixture: ComponentFixture<Me0036PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0036PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0036PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
