import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0008PageComponent } from './me0008-page.component';

describe('Me0008PageComponent', () => {
  let component: Me0008PageComponent;
  let fixture: ComponentFixture<Me0008PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0008PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0008PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
