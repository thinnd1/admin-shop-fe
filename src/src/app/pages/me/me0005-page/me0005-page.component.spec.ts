import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0005PageComponent } from './me0005-page.component';

describe('Me0005PageComponent', () => {
  let component: Me0005PageComponent;
  let fixture: ComponentFixture<Me0005PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0005PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0005PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
