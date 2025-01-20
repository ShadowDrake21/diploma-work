import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingActionsComponent } from './pending-actions.component';

describe('PendingActionsComponent', () => {
  let component: PendingActionsComponent;
  let fixture: ComponentFixture<PendingActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
