import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenCreateMessage } from './screen-create-message';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { InternetCommentsServices } from '../../../SERVICES/internet-comments.services';
import { ToastService } from '../../../SERVICES/toast';
import { FormsModule } from '@angular/forms';

describe('ScreenCreateMessage', () => {
  let component: ScreenCreateMessage;
  let fixture: ComponentFixture<ScreenCreateMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenCreateMessage],
      imports: [FormsModule],
      providers: [
        {
          provide: Router,
          useValue: { navigate: (_commands: any[]) => Promise.resolve(true) }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: {
              subscribe: (fn: any) => {
                fn(convertToParamMap({}));
                return { unsubscribe() {} };
              }
            }
          }
        },
        {
          provide: InternetUserService,
          useValue: {
            getUserById: (_id: string, cb: any) => cb({ success: true, user: null }),
            userFind: (_query: string, _limit: number, cb: any) => cb({ success: true, users: [] })
          }
        },
        {
          provide: InternetCommentsServices,
          useValue: {
            commentAdd: (_targetId: string, _targetType: string, _text: string, _parent: any, cb: any) => cb({ success: true })
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

    fixture = TestBed.createComponent(ScreenCreateMessage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
