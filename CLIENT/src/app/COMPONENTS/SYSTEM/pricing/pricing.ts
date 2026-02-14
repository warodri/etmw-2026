import { Component, OnInit, signal } from '@angular/core';
import { UtilClass } from '../../../utils/utils';
import { Router } from '@angular/router';
import { UserModel } from '../../../models/user';
import { InternetUserService } from '../../../SERVICES/internet-user.service';

@Component({
    selector: 'app-pricing',
    standalone: false,
    templateUrl: './pricing.html',
    styleUrl: './pricing.css',
})
export class Pricing implements OnInit {

    myUser = signal<UserModel | null>(null);

    selectedRegion = signal<'latam' | 'us' | 'uk' | 'global'>('global');
    currency = signal<string>('€');
    prices = signal<{ 
        explorer: string, 
        reader: string, 
        unlimited: 
        string 
    } | null>({
        explorer: '3.49',
        reader: '4.99',
        unlimited: '8.49'
    });

    //  Flags
    showLogin = signal<boolean>(false);

    constructor(
        private router: Router,
        private iUser: InternetUserService
    ) {}

    ngOnInit() {
        this.loadMyUser(() => {
            this.detectRegion();        
        })
    }

    loadMyUser(callback: any) {
        this.iUser.getMyUser((response: any) => {
            console.log('getMyUser', response)
            if (response && response.success) {
                this.myUser.set(response.user);
            }
            callback();
        })
    }

    private detectRegion() {
        const regionInfo = UtilClass.detectRegion();        
        if (regionInfo.region == 'latam') {
            this.selectedRegion.set('latam');
            this.currency.set('$');
            // this.prices.set({
            //     explorer: '3.49',
            //     reader: '4.99',
            //     unlimited: '8.49'
            // });
        }        
        else if (regionInfo.region == 'us') {
            this.selectedRegion.set('us');
            this.currency.set('$');
            // this.prices.set({
            //     explorer: '6.49',
            //     reader: '9.99',
            //     unlimited: '14.99'
            // });
        } 
        else if (regionInfo.region == 'uk') {
            this.selectedRegion.set('uk');
            this.currency.set('£');
            // this.prices.set({
            //     explorer: '6.49',
            //     reader: '9.99',
            //     unlimited: '14.99'
            // });
        } 
        else {
            this.selectedRegion.set('global');
            this.currency.set('$');
            // this.prices.set({
            //     explorer: '6.49',
            //     reader: '9.99',
            //     unlimited: '14.99'
            // });
        }
    }

    toggleShowLogin() {
        this.showLogin.set(!this.showLogin());
    }
    
}
