import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ScreenHome } from './SCREEN/screen-home/screen-home';
import { ScreenItemDetail } from './SCREEN/screen-item-detail/screen-item-detail';
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
        ScreenPartners
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    imports: [
        BrowserModule,
        AppRoutingModule
    ],
    providers: [
        provideBrowserGlobalErrorListeners()
    ],
    bootstrap: [App]
})
export class AppModule { }
