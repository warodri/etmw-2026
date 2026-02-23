import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenResumePayment } from './screen-resume-payment';

describe('ScreenResumePayment', () => {
  let component: ScreenResumePayment;
  let fixture: ComponentFixture<ScreenResumePayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenResumePayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenResumePayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
