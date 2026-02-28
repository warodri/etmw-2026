import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScreenHome } from './SCREEN/screen-home/screen-home';
import { ScreenMobileMain } from './SCREEN/MOBILE/screen-mobile-main/screen-mobile-main';
import { ScreenInbox } from './SCREEN/INBOX/screen-inbox/screen-inbox';
import { ScreenUserProfile } from './SCREEN/USER/screen-user-profile/screen-user-profile';
import { ScreenSearch } from './SCREEN/SEARCH/screen-search/screen-search';
import { ScreenPlayer } from './SCREEN/PLAYER/screen-player/screen-player';
import { ScreenDebates } from './SCREEN/DEBATES/screen-debates/screen-debates';
import { ScreenAuthors } from './SCREEN/AUTHOR/screen-authors/screen-authors';
import { ScreenPartners } from './SCREEN/PARTNERS/screen-partners/screen-partners';
import { ScreenUploadAudiobook } from './SCREEN/AUDIOBOOK/screen-upload-audiobook/screen-upload-audiobook';
import { ScreenPaymentSuccess } from './SCREEN/PAYMENT/screen-payment-success/screen-payment-success';
import { ScreenPaymentFailed } from './SCREEN/PAYMENT/screen-payment-failed/screen-payment-failed';
import { ScreenPaymentCencelled } from './SCREEN/PAYMENT/screen-payment-cencelled/screen-payment-cencelled';
import { ScreenTutorials } from './SCREEN/SYSTEM/screen-tutorials/screen-tutorials';
import { ScreenContactSupport } from './SCREEN/SYSTEM/screen-contact-support/screen-contact-support';
import { ScreenStories } from './SCREEN/STORIES/screen-stories/screen-stories';
import { ScreenItemDetail } from './SCREEN/AUDIOBOOK/screen-item-detail/screen-item-detail';
import { ScreenAdminComponent } from './SCREEN/ADMIN/screen-admin/screen-admin';
import { ScreenCreateMessage } from './SCREEN/INBOX/screen-create-message/screen-create-message';
import { ScreenResumePayment } from './SCREEN/AUDIOBOOK/screen-resume-payment/screen-resume-payment';
import { ScreenCreateYourStory } from './SCREEN/AUDIOBOOK/screen-create-your-story/screen-create-your-story';

const routes: Routes = [
    { path: '', component: ScreenHome },
    { path: 'app', component: ScreenMobileMain },
    
    //  Inbox / Messages
    { path: 'app/inbox', component: ScreenInbox },
    { path: 'app/inbox/new-message', component: ScreenCreateMessage },
    { path: 'app/inbox/new-message/:userId', component: ScreenCreateMessage },
    
    //  User profile
    { path: 'app/user-profile/:id', component: ScreenUserProfile },
    
    //  Search audiobooks
    { path: 'app/search', component: ScreenSearch },
    { path: 'app/search/query/:query', component: ScreenSearch },
    { path: 'app/search/section/:section', component: ScreenSearch },
    { path: 'app/search/author/:authorId', component: ScreenSearch },
    { path: 'app/search/category/:category', component: ScreenSearch },
    { path: 'app/search/:term', component: ScreenSearch },

    { path: 'app/player/:audiobookId/:chapterNumber', component: ScreenPlayer },
    { path: 'app/authors', component: ScreenAuthors },
    { path: 'app/partners', component: ScreenPartners },
    { path: 'app/audiobooks/upload', component: ScreenUploadAudiobook },
    { path: 'app/audiobooks/payment/pending', component: ScreenResumePayment },
    
    //  Create your story
    { path: 'app/audiobooks/create-your-story', component: ScreenCreateYourStory },
    
    //  Debate
    { path: 'app/debate', component: ScreenDebates },
    { path: 'app/debate/:audiobookId', component: ScreenDebates },
   
    //  Audiobook Detail
    { path: 'app/audiobook/view/:id', component: ScreenItemDetail },
   
    //  Payment
    { path: 'payment/success', component: ScreenPaymentSuccess },
    { path: 'payment/failed', component: ScreenPaymentFailed },
    { path: 'payment/cancelled', component: ScreenPaymentCencelled },

    //  Use this to show multiple tutorials or information text
    { path: 'app/page/:section', component: ScreenTutorials },

    //  Contact support
    { path: 'app/contact-support', component: ScreenContactSupport },

    //  Stories
    { path: 'app/stories', component: ScreenStories },

    //  Partners
    { path: 'partners/:id', component: ScreenPartners },

    //  Admin
    { path: 'app/admin', component: ScreenAdminComponent },

];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        useHash: true,
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
        onSameUrlNavigation: 'reload'
    })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
