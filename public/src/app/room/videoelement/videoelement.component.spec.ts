import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoelementComponent } from './videoelement.component';

describe('VideoelementComponent', () => {
  let component: VideoelementComponent;
  let fixture: ComponentFixture<VideoelementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoelementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoelementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
