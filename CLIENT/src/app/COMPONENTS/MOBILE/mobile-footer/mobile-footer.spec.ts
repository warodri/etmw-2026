import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileFooter } from './mobile-footer';

describe('MobileFooter', () => {
  let component: MobileFooter;
  let fixture: ComponentFixture<MobileFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MobileFooter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
