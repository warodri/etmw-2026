import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ScreenHome } from './SCREEN/screen-home/screen-home';
import { ScreenSearch } from './SCREEN/screen-search/screen-search';
import { ScreenItemDetail } from './SCREEN/screen-item-detail/screen-item-detail';
import { Main } from './COMPONENTS/MAIN/main/main';
import { Search } from './COMPONENTS/SEARCH/search/search';
import { ItemDetail } from './COMPONENTS/ITEMS/item-detail/item-detail';
import { Item } from './COMPONENTS/ITEMS/item/item';
import { DotPattern } from './COMPONENTS/SYSTEM/dot-pattern/dot-pattern';

@NgModule({
  declarations: [
    App,
    ScreenHome,
    ScreenSearch,
    ScreenItemDetail,
    Main,
    Search,
    ItemDetail,
    Item,
    DotPattern
  ],
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
