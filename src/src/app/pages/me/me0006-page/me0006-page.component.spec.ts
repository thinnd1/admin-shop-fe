import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0006PageComponent } from './me0006-page.component';

describe('Me0006PageComponent', () => {
  let component: Me0006PageComponent;
  let fixture: ComponentFixture<Me0006PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0006PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0006PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
