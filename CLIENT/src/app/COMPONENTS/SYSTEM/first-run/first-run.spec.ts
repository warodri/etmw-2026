import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstRun } from './first-run';

describe('FirstRun', () => {
  let component: FirstRun;
  let fixture: ComponentFixture<FirstRun>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FirstRun]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirstRun);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
