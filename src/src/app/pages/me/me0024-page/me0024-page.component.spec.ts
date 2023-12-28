import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0024PageComponent } from './me0024-page.component';

describe('Me0024PageComponent', () => {
  let component: Me0024PageComponent;
  let fixture: ComponentFixture<Me0024PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0024PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0024PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
