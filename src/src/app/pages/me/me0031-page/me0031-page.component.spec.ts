import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0031PageComponent } from './me0031-page.component';

describe('Me0031PageComponent', () => {
  let component: Me0031PageComponent;
  let fixture: ComponentFixture<Me0031PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0031PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0031PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
