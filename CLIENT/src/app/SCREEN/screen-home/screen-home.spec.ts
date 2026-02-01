import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenHome } from './screen-home';

describe('ScreenHome', () => {
  let component: ScreenHome;
  let fixture: ComponentFixture<ScreenHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
