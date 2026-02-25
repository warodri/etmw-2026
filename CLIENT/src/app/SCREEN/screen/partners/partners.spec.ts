import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Partners } from './partners';

describe('Partners', () => {
  let component: Partners;
  let fixture: ComponentFixture<Partners>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Partners]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Partners);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
