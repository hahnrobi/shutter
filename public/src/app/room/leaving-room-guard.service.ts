import { TranslatePipe } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}
@Injectable()
export class LeavingRoomGuardService {
  constructor(private translate: TranslatePipe) {

  }
  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    return component.canDeactivate() ?
      true : confirm(this.translate.transform('WARNING: Are you sure that want to leave the room?'));
  }
}
