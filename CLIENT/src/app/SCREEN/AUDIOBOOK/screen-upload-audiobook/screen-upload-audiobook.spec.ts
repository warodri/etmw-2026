import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenUploadAudiobook } from './screen-upload-audiobook';

describe('ScreenUploadAudiobook', () => {
  let component: ScreenUploadAudiobook;
  let fixture: ComponentFixture<ScreenUploadAudiobook>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenUploadAudiobook]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenUploadAudiobook);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
