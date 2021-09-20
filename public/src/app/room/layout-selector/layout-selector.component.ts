import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'room-layout-selector',
  templateUrl: './layout-selector.component.html',
  styleUrls: ['./layout-selector.component.scss']
})
export class LayoutSelectorComponent implements OnInit {

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
