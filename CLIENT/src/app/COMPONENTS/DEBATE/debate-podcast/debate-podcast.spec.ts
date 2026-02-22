import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebatePodcast } from './debate-podcast';
import { InternetDebateService } from '../../../SERVICES/internet-debate.services';
import { ToastService } from '../../../SERVICES/toast';

describe('DebatePodcast', () => {
  let component: DebatePodcast;
  let fixture: ComponentFixture<DebatePodcast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DebatePodcast],
      providers: [
        {
          provide: InternetDebateService,
          useValue: {
            debatePodcastGet: (_a: string, _b: number, _c: number, cb: any) => cb({ success: true, podcasts: [], hasMore: false }),
            debateGeneratePodcast: (_a: string, cb: any) => cb({ success: true })
          }
        },
        {
          provide: ToastService,
          useValue: {
            show: (_message: string) => null,
            getMessageErrorUnexpected: () => 'Unexpected error'
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebatePodcast);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
