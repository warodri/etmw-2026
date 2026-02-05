import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenMobileMain } from './screen-mobile-main';

describe('ScreenMobileMain', () => {
  let component: ScreenMobileMain;
  let fixture: ComponentFixture<ScreenMobileMain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenMobileMain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenMobileMain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
