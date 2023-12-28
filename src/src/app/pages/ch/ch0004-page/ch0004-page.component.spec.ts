import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ch0004PageComponent } from './ch0004-page.component';

describe('Ch0004PageComponent', () => {
  let component: Ch0004PageComponent;
  let fixture: ComponentFixture<Ch0004PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ch0004PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ch0004PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
