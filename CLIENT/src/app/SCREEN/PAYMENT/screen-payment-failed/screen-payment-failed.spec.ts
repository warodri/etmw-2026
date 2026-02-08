import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenPaymentFailed } from './screen-payment-failed';

describe('ScreenPaymentFailed', () => {
  let component: ScreenPaymentFailed;
  let fixture: ComponentFixture<ScreenPaymentFailed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenPaymentFailed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenPaymentFailed);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
