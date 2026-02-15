import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenContactSupport } from './screen-contact-support';

describe('ScreenContactSupport', () => {
  let component: ScreenContactSupport;
  let fixture: ComponentFixture<ScreenContactSupport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenContactSupport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenContactSupport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
