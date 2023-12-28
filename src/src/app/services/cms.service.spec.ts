/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CmsService } from './cms.service';

describe('CmsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CmsService]
    });
  });

  it('should ...', inject([CmsService], (service: CmsService) => {
    expect(service).toBeTruthy();
  }));
});
