import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenPaymentSuccess } from './screen-payment-success';

describe('ScreenPaymentSuccess', () => {
  let component: ScreenPaymentSuccess;
  let fixture: ComponentFixture<ScreenPaymentSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenPaymentSuccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenPaymentSuccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
