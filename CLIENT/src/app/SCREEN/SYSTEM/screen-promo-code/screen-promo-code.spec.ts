import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenPromoCode } from './screen-promo-code';

describe('ScreenPromoCode', () => {
  let component: ScreenPromoCode;
  let fixture: ComponentFixture<ScreenPromoCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenPromoCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenPromoCode);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
