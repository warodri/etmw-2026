import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenPartners } from './screen-partners';

describe('ScreenPartners', () => {
  let component: ScreenPartners;
  let fixture: ComponentFixture<ScreenPartners>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenPartners]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenPartners);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
