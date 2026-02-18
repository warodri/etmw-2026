import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenAdmin } from './screen-admin';

describe('ScreenAdmin', () => {
  let component: ScreenAdmin;
  let fixture: ComponentFixture<ScreenAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
