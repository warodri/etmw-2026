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
import { ScreenItemDetail } from './SCREEN/screen-item-detail/screen-item-detail';

const routes: Routes = [
    { path: '', component: ScreenHome },
    { path: 'app', component: ScreenMobileMain },
    { path: 'app/inbox', component: ScreenInbox },
    { path: 'app/user-profile/:id', component: ScreenUserProfile },
    { path: 'app/search', component: ScreenSearch },
    { path: 'app/player/:audiobookId/:chapterNumber', component: ScreenPlayer },
    { path: 'app/debate', component: ScreenDebates },
    { path: 'app/authors', component: ScreenAuthors },
    { path: 'app/partners', component: ScreenPartners },
    { path: 'app/audiobooks/upload', component: ScreenUploadAudiobook },
    //  Audiobook Detail
    { path: 'app/audiobook/view/:id', component: ScreenItemDetail },
    //  Payment
    { path: 'payment/success', component: ScreenPaymentSuccess },
    { path: 'payment/failed', component: ScreenPaymentFailed },
    { path: 'payment/cancelled', component: ScreenPaymentCencelled },
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
