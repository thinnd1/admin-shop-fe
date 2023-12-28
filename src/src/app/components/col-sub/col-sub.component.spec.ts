/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ColSubComponent } from './col-sub.component';

describe('ColSubComponent', () => {
  let component: ColSubComponent;
  let fixture: ComponentFixture<ColSubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColSubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColSubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
