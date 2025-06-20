import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseFormComponent } from './base-form.component';
import { Component } from '@angular/core';

@Component({
  template: '',
})
class TestFormComponent extends BaseFormComponent {}

describe('BaseFormComponent', () => {
  let component: TestFormComponent;
  let fixture: ComponentFixture<TestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('compareIds', () => {
    it('should return true for same string ids', () => {
      expect(component.compareIds('123', '123')).toBeTrue();
    });

    it('should return true for same number ids', () => {
      expect(component.compareIds(123, 123)).toBeTrue();
    });

    it('should return true for same id when one is string and one is number', () => {
      expect(component.compareIds('123', 123)).toBeTrue();
    });

    it('should return false for different ids', () => {
      expect(component.compareIds('123', '456')).toBeFalse();
    });
  });
});
