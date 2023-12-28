import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0001PageComponent } from './me0001-page.component';

describe('Me0001PageComponent', () => {
  let component: Me0001PageComponent;
  let fixture: ComponentFixture<Me0001PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0001PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0001PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
