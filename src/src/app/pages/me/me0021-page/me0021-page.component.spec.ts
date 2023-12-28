import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0021PageComponent } from './me0021-page.component';

describe('Me0021PageComponent', () => {
  let component: Me0021PageComponent;
  let fixture: ComponentFixture<Me0021PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0021PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0021PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
