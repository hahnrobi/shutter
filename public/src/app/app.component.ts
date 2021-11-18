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
  public availableLanguages = ["en", "hu"];
  public headerTitle:BehaviorSubject<string>;


  constructor(private translateService:TranslateService, headerTitle:HeaderTitleService) {
    this.translateService.setDefaultLang("en");
    if(localStorage.getItem("lang") != null) {
      this.translateService.use(localStorage.getItem("lang") || 'en');
    }else{
      const userLang = navigator.language;
      if(userLang == "hu-HU") {
        this.translateService.use("hu");
      }
    }
    this.headerTitle = headerTitle.title;
  }

  ngOnInit() {
    this.language = localStorage.getItem('lang') || 'en';
  }
  title = 'shutter';
  changeLanguage(lang?:string) {
    if(lang === undefined) {
      let index = this.availableLanguages.findIndex((l) => l == this.language);
      if(index != -1) {
        index++;
        if(index == this.availableLanguages.length) {
          index = 0;
        }
        lang = this.availableLanguages[index];
      }
    }

    this.language = lang;
    localStorage.setItem("lang", lang);
    this.translateService.use(localStorage.getItem("lang") || 'en');
    console.log(lang);
  } 
}
