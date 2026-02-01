import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenItemDetail } from './screen-item-detail';

describe('ScreenItemDetail', () => {
  let component: ScreenItemDetail;
  let fixture: ComponentFixture<ScreenItemDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenItemDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenItemDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
