import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationsTableComponent } from './publications-table.component';

describe('PublicationsTableComponent', () => {
  let component: PublicationsTableComponent;
  let fixture: ComponentFixture<PublicationsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
