import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenInbox } from './screen-inbox';

describe('ScreenInbox', () => {
  let component: ScreenInbox;
  let fixture: ComponentFixture<ScreenInbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenInbox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenInbox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
