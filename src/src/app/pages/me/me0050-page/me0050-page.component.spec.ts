import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0050PageComponent } from './me0050-page.component';

describe('Me0050PageComponent', () => {
  let component: Me0050PageComponent;
  let fixture: ComponentFixture<Me0050PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0050PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0050PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
