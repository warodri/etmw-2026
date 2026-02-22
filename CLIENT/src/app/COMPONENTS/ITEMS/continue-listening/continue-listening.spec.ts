import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinueListening } from './continue-listening';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';
import { Router } from '@angular/router';

describe('ContinueListening', () => {
  let component: ContinueListening;
  let fixture: ComponentFixture<ContinueListening>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContinueListening],
      providers: [
        {
          provide: InternetAudiobookService,
          useValue: {
            audiobookGetContineListening: (cb: any) => cb({ success: true, listening: [] })
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: (_commands: any[]) => Promise.resolve(true)
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContinueListening);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
