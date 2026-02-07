import { Injectable, OnInit } from '@angular/core';
import { Config } from '../utils/config';

@Injectable({
    providedIn: 'root',
})
export class UtilsService {

    private SERVER = Config.SERVER.dev ? Config.SERVER.local : Config.SERVER.remote;
    
    getClientUrlForFiles(fileName: string, mimetype: string ) {
        const base64Mime = btoa(mimetype);
        return this.SERVER + '/file/' + fileName + '/' + base64Mime
    }    

}
