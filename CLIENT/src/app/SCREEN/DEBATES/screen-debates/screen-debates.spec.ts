import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenDebates } from './screen-debates';

describe('ScreenDebates', () => {
  let component: ScreenDebates;
  let fixture: ComponentFixture<ScreenDebates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenDebates]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenDebates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
