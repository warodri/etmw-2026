import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsText } from './terms-text';

describe('TermsText', () => {
  let component: TermsText;
  let fixture: ComponentFixture<TermsText>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TermsText]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsText);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
