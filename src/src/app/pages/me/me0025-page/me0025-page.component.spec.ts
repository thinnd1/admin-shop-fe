import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0025PageComponent } from './me0025-page.component';

describe('Me0025PageComponent', () => {
  let component: Me0025PageComponent;
  let fixture: ComponentFixture<Me0025PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0025PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0025PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
