import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0014PageComponent } from './me0014-page.component';

describe('Me0014PageComponent', () => {
  let component: Me0014PageComponent;
  let fixture: ComponentFixture<Me0014PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0014PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0014PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
