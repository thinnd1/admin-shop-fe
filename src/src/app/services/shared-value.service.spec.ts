/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SharedValueService } from './shared-value.service';

describe('SharedValueService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharedValueService]
    });
  });

  it('should ...', inject([SharedValueService], (service: SharedValueService) => {
    expect(service).toBeTruthy();
  }));
});
