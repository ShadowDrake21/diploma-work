import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequentLinksComponent } from './frequent-links.component';

describe('FrequentLinksComponent', () => {
  let component: FrequentLinksComponent;
  let fixture: ComponentFixture<FrequentLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrequentLinksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrequentLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
