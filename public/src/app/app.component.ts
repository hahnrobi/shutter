import { HeaderTitleService } from './header-title-service';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
  public language:string;
  public headerTitle:BehaviorSubject<string>;


  constructor(private translateService:TranslateService, headerTitle:HeaderTitleService) {
    this.translateService.setDefaultLang("en");
    this.translateService.use(localStorage.getItem("lang") || 'en');
    this.headerTitle = headerTitle.title;
  }

  ngOnInit() {
    this.language = localStorage.getItem('lang') || 'en';
  }
  title = 'shutter';
  changeLanguage(lang:string) {
    this.language = lang;
    localStorage.setItem("lang", lang);
    this.translateService.use(localStorage.getItem("lang") || 'en');
    console.log(lang);
  } 
}
