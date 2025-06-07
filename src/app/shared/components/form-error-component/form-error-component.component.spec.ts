import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormErrorComponentComponent } from './form-error-component.component';

describe('FormErrorComponentComponent', () => {
  let component: FormErrorComponentComponent;
  let fixture: ComponentFixture<FormErrorComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormErrorComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormErrorComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
