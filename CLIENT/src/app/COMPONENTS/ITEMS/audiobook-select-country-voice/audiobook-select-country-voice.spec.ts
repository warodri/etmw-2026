import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudiobookSelectCountryVoice } from './audiobook-select-country-voice';

describe('AudiobookSelectCountryVoice', () => {
  let component: AudiobookSelectCountryVoice;
  let fixture: ComponentFixture<AudiobookSelectCountryVoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudiobookSelectCountryVoice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudiobookSelectCountryVoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
