/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DirectionsService } from './directions.service';

describe('Service: Directions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DirectionsService]
    });
  });

  it('should ...', inject([DirectionsService], (service: DirectionsService) => {
    expect(service).toBeTruthy();
  }));
});
