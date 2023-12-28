import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0035PageComponent } from './me0035-page.component';

describe('Me0035PageComponent', () => {
  let component: Me0035PageComponent;
  let fixture: ComponentFixture<Me0035PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0035PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0035PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
