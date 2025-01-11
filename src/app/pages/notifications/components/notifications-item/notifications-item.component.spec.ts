import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsItemComponent } from './notifications-item.component';

describe('NotificationsItemComponent', () => {
  let component: NotificationsItemComponent;
  let fixture: ComponentFixture<NotificationsItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
