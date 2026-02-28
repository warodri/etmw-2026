import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudiobookSelectCover } from './audiobook-select-cover';

describe('AudiobookSelectCover', () => {
  let component: AudiobookSelectCover;
  let fixture: ComponentFixture<AudiobookSelectCover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudiobookSelectCover]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudiobookSelectCover);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
