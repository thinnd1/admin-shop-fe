import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0032PageComponent } from './me0032-page.component';

describe('Me0032PageComponent', () => {
  let component: Me0032PageComponent;
  let fixture: ComponentFixture<Me0032PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0032PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0032PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
