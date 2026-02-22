import { Injectable } from '@angular/core';
import { LangUtils } from "../utils/lang";
import { HttpClient } from '@angular/common/http';
import { InternetService } from './internet.service';

@Injectable({
    providedIn: 'root'
})
export class InternetReactionService extends InternetService {

    constructor(
        httpClient: HttpClient  // Add this
    ) {
        super(httpClient)  // Pass to parent
    }   

    reactionUpsert(
        targetId: string,
        targetType: 'user' | 'author' | 'audiobook' | 'comment' | 'debate' | 'debate-comment',
        reaction: 'like' | 'love' | 'insightful' | 'angry' | 'sad' | 'wow',
        callback: any
    ) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'ReactionUpsert',
            lang,
            data: {
                targetId,
                targetType,
                reaction
            }
        }, callback);
    }

    reactionGetMine(
        targetId: string | null,
        targetType: 'user' | 'author' | 'audiobook' | 'comment' | 'debate' | 'debate-comment' | null,
        targetIds: string[] | null,
        callback: any
    ) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'ReactionGetMine',
            lang,
            data: {
                targetId,
                targetType,
                targetIds,
            }
        }, callback);
    }


}
