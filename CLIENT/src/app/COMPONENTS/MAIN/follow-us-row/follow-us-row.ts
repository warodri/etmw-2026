import { Component } from '@angular/core';
import { LangUtils } from '../../../utils/lang';

@Component({
  selector: 'app-follow-us-row',
  standalone: false,
  templateUrl: './follow-us-row.html',
  styleUrl: './follow-us-row.css',
})
export class FollowUsRow {
  language: 'en' | 'es' = LangUtils.detectLanguage();

  tr(enText: string, esText: string) {
    return this.language === 'es' ? esText : enText;
  }

}
