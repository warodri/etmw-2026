import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScreenHome } from './SCREEN/screen-home/screen-home';

const routes: Routes = [
    { path: '', component: ScreenHome}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
