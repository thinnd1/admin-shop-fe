import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0030PageComponent } from './me0030-page.component';

describe('Me0030PageComponent', () => {
  let component: Me0030PageComponent;
  let fixture: ComponentFixture<Me0030PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0030PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0030PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
