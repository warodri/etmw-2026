import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from '../utils/config';
import { InternetCommon } from '../utils/internet.common';
import { LangUtils } from '../utils/lang';

@Injectable({
    providedIn: 'root'
})
export class InternetService {

    APP = Config.dev ? 'api/v1' : 'api/v1';
    APP_SECURE = Config.dev ? 'api/v1/secure' : 'api/v1/secure';
    SERVER = Config.SERVER.dev ? Config.SERVER.local : Config.SERVER.remote;
    SERVER_SOCKET = Config.dev ? Config.SOCKET_SERVER.local : Config.SOCKET_SERVER.remote;
    SERVER_SOCKET_PORT = Config.SOCKET_SERVER.port;
    internetCommon: InternetCommon | undefined;

    constructor(
        private httpClient: HttpClient
    ) {
        this.internetCommon = new InternetCommon(this.httpClient);
    }

}
