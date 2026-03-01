import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenSubscriptionSettings } from './screen-subscription-settings';

describe('ScreenSubscriptionSettings', () => {
  let component: ScreenSubscriptionSettings;
  let fixture: ComponentFixture<ScreenSubscriptionSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenSubscriptionSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenSubscriptionSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
