import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ch0005PageComponent } from './ch0005-page.component';

describe('Ch0005PageComponent', () => {
  let component: Ch0005PageComponent;
  let fixture: ComponentFixture<Ch0005PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ch0005PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ch0005PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
