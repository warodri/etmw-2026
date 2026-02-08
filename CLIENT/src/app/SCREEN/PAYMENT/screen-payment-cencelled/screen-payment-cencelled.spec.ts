import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenPaymentCencelled } from './screen-payment-cencelled';

describe('ScreenPaymentCencelled', () => {
  let component: ScreenPaymentCencelled;
  let fixture: ComponentFixture<ScreenPaymentCencelled>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenPaymentCencelled]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenPaymentCencelled);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
