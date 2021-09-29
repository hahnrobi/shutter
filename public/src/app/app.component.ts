import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
  public language:string;

  constructor(private translateService:TranslateService) {
    this.translateService.setDefaultLang("en");
    this.translateService.use(localStorage.getItem("lang") || 'en');
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
