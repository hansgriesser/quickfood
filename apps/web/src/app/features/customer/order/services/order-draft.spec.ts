import { TestBed } from '@angular/core/testing';

import { OrderDraft } from './order-draft';

describe('OrderDraft', () => {
  let service: OrderDraft;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderDraft);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
