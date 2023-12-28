import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0033PageComponent } from './me0033-page.component';

describe('Me0033PageComponent', () => {
  let component: Me0033PageComponent;
  let fixture: ComponentFixture<Me0033PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0033PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0033PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
