import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenUserProfile } from './screen-user-profile';

describe('ScreenUserProfile', () => {
  let component: ScreenUserProfile;
  let fixture: ComponentFixture<ScreenUserProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenUserProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenUserProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
