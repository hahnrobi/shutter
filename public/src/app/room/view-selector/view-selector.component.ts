import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-view-selector',
  templateUrl: './view-selector.component.html',
  styleUrls: ['./view-selector.component.scss']
})
export class ViewSelectorComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input() view;
  @Output() viewChanged = new EventEmitter();

  change(view:string) {
    this.view = view;
    this.viewChanged.emit(this.view);
  }

}
