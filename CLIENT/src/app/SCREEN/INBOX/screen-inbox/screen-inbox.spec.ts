import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenInbox } from './screen-inbox';
import { Router } from '@angular/router';
import { InternetCommentsServices } from '../../../SERVICES/internet-comments.services';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { ToastService } from '../../../SERVICES/toast';

describe('ScreenInbox', () => {
  let component: ScreenInbox;
  let fixture: ComponentFixture<ScreenInbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenInbox],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: (_commands: any[]) => Promise.resolve(true)
          }
        },
        {
          provide: InternetCommentsServices,
          useValue: {
            commentFind: (
              _targetType: string,
              _conversationWithUserId: string | null,
              _skip: number,
              _limit: number,
              _sortDir: string,
              cb: any
            ) => cb({ success: true, comments: [] })
            ,
            commentMarkRead: (_conversationWithUserId: string | null, _messageId: string | null, cb: any) => cb({ success: true, updated: 0 })
          }
        },
        {
          provide: InternetUserService,
          useValue: {
            getMyUser: (cb: any) => cb({ success: true, user: { _id: 'me' } }),
            getUserById: (_id: string, cb: any) => cb({ success: true, user: null })
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

    fixture = TestBed.createComponent(ScreenInbox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
