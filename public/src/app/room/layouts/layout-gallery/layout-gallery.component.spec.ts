import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutGalleryComponent } from './layout-gallery.component';

describe('LayoutGalleryComponent', () => {
  let component: LayoutGalleryComponent;
  let fixture: ComponentFixture<LayoutGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayoutGalleryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
