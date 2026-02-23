import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumePaymentWarning } from './resume-payment-warning';

describe('ResumePaymentWarning', () => {
  let component: ResumePaymentWarning;
  let fixture: ComponentFixture<ResumePaymentWarning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResumePaymentWarning]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumePaymentWarning);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
