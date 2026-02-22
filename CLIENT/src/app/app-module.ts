import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ScreenHome } from './SCREEN/screen-home/screen-home';
import { Main } from './COMPONENTS/MAIN/main/main';
import { Search } from './COMPONENTS/SEARCH/search/search';
import { ItemDetail } from './COMPONENTS/ITEMS/item-detail/item-detail';
import { Item } from './COMPONENTS/ITEMS/item/item';
import { DotPattern } from './COMPONENTS/SYSTEM/dot-pattern/dot-pattern';
import { Translate } from './COMPONENTS/SYSTEM/translate/translate';
import { ScreenMobileMain } from './SCREEN/MOBILE/screen-mobile-main/screen-mobile-main';
import { MobileHeader } from './COMPONENTS/MOBILE/mobile-header/mobile-header';
import { MobileFooter } from './COMPONENTS/MOBILE/mobile-footer/mobile-footer';
import { ScreenInbox } from './SCREEN/INBOX/screen-inbox/screen-inbox';
import { ScreenUserProfile } from './SCREEN/USER/screen-user-profile/screen-user-profile';
import { ItemList } from './COMPONENTS/ITEMS/item-list/item-list';
import { ScreenSearch } from './SCREEN/SEARCH/screen-search/screen-search';
import { ScreenPlayer } from './SCREEN/PLAYER/screen-player/screen-player';
import { EtmwPlayer } from './COMPONENTS/PLAYER/etmw-player/etmw-player';
import { SpotifyPlayer } from './COMPONENTS/PLAYER/spotify-player/spotify-player';
import { ScreenDebates } from './SCREEN/DEBATES/screen-debates/screen-debates';
import { AuthorItem } from './COMPONENTS/AUTHOR/author-item/author-item';
import { ScreenAuthors } from './SCREEN/AUTHOR/screen-authors/screen-authors';
import { ScreenPartners } from './SCREEN/PARTNERS/screen-partners/screen-partners';
import { FirstRun } from './COMPONENTS/SYSTEM/first-run/first-run';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { NgxEditorModule } from 'ngx-editor';
import { AuthInterceptor } from './utils/auth.interceptor';
import { ToastComponent } from './COMPONENTS/SYSTEM/toast/toast.component';
import { ScreenUploadAudiobook } from './SCREEN/AUDIOBOOK/screen-upload-audiobook/screen-upload-audiobook';
import { TermsText } from './COMPONENTS/SYSTEM/terms-text/terms-text';
import { ScreenPaymentSuccess } from './SCREEN/PAYMENT/screen-payment-success/screen-payment-success';
import { ScreenPaymentFailed } from './SCREEN/PAYMENT/screen-payment-failed/screen-payment-failed';
import { ScreenPaymentCencelled } from './SCREEN/PAYMENT/screen-payment-cencelled/screen-payment-cencelled';
import { Pricing } from './COMPONENTS/SYSTEM/pricing/pricing';
import { ContinueListening } from './COMPONENTS/ITEMS/continue-listening/continue-listening';
import { CategoryWithAudiobooks } from './COMPONENTS/ITEMS/category-with-audiobooks/category-with-audiobooks';
import { ScreenTutorials } from './SCREEN/SYSTEM/screen-tutorials/screen-tutorials';
import { ContactForm } from './COMPONENTS/SYSTEM/contact-form/contact-form';
import { ScreenContactSupport } from './SCREEN/SYSTEM/screen-contact-support/screen-contact-support';
import { ScreenStories } from './SCREEN/STORIES/screen-stories/screen-stories';
import { Authors } from './COMPONENTS/AUTHOR/authors/authors';
import { Categories } from './COMPONENTS/ITEMS/categories/categories';
import { HomepageCategoriesAndBooks } from './COMPONENTS/ITEMS/homepage-categories-and-books/homepage-categories-and-books';
import { ScreenItemDetail } from './SCREEN/AUDIOBOOK/screen-item-detail/screen-item-detail';
import { CommonModule } from '@angular/common';
import { ScreenAdminComponent } from './SCREEN/ADMIN/screen-admin/screen-admin';
import { DebateCommentCard } from './COMPONENTS/DEBATE/debate-comment-card/debate-comment-card';
import { DebatePopularThreads } from './COMPONENTS/DEBATE/debate-popular-threads/debate-popular-threads';
import { DebateRecentThreads } from './COMPONENTS/DEBATE/debate-recent-threads/debate-recent-threads';
import { DebatePodcast } from './COMPONENTS/DEBATE/debate-podcast/debate-podcast';
import { DebateComments } from './COMPONENTS/DEBATE/debate-comments/debate-comments';
import { FollowUsRow } from './COMPONENTS/MAIN/follow-us-row/follow-us-row';
import { DebateAddComment } from './COMPONENTS/DEBATE/debate-add-comment/debate-add-comment';

@NgModule({
    declarations: [
        App,
        ScreenHome,
        ScreenItemDetail,
        Main,
        Search,
        ItemDetail,
        Item,
        DotPattern,
        Translate,
        ScreenMobileMain,
        MobileHeader,
        MobileFooter,
        ScreenInbox,
        ScreenUserProfile,
        ItemList,
        ScreenSearch,
        ScreenPlayer,
        EtmwPlayer,
        SpotifyPlayer,
        ScreenDebates,
        AuthorItem,
        ScreenAuthors,
        ScreenPartners,
        FirstRun,
        ToastComponent,
        ScreenUploadAudiobook,
        TermsText,
        ScreenPaymentSuccess,
        ScreenPaymentFailed,
        ScreenPaymentCencelled,
        Pricing,
        ContinueListening,
        CategoryWithAudiobooks,
        ScreenTutorials,
        ContactForm,
        ScreenContactSupport,
        ScreenStories,
        Authors,
        Categories,
        HomepageCategoriesAndBooks,
        ScreenAdminComponent,
        DebateCommentCard,
        DebatePopularThreads,
        DebateRecentThreads,
        DebatePodcast,
        DebateComments,
        FollowUsRow,
        DebateAddComment,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    imports: [
        HttpClientModule, 
        BrowserModule,
        CommonModule,
        AppRoutingModule,
        FormsModule,
        ImageCropperComponent,
        NgxEditorModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    providers: [
        provideHttpClient(),
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        provideBrowserGlobalErrorListeners()
    ],
    bootstrap: [App]
})
export class AppModule { }
