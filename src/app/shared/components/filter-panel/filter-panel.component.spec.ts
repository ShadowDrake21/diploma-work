import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterPanelComponent } from './filter-panel.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TagService } from '@core/services/project/models/tag.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { ProjectStatus } from '@shared/enums/project.enums';
import { ProjectSearchFilters } from '@shared/types/search.types';
import { of } from 'rxjs';

describe('FilterPanelComponent', () => {
  let component: FilterPanelComponent;
  let fixture: ComponentFixture<FilterPanelComponent>;
  let tagServiceMock: jasmine.SpyObj<TagService>;

  beforeEach(async () => {
    tagServiceMock = jasmine.createSpyObj('TagService', ['getAllTags']);
    tagServiceMock.getAllTags.and.returnValue(
      of([{ id: 1, name: 'Test Tag' }])
    );

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        FilterPanelComponent,
      ],
      providers: [
        FormBuilder,
        { provide: TagService, useValue: tagServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.searchForm).toBeDefined();
    expect(component.searchForm.get('searchQuery')?.value).toBe('');
    expect(component.searchForm.get('projectTypes')?.value).toEqual([]);
    expect(component.searchForm.get('tags')?.value).toEqual([]);
    expect(component.searchForm.get('dateRange.start')?.value).toBeNull();
    expect(component.searchForm.get('dateRange.end')?.value).toBeNull();
    expect(component.searchForm.get('status.assigned')?.value).toBeFalse();
    expect(component.searchForm.get('status.inProgress')?.value).toBeFalse();
    expect(component.searchForm.get('status.completed')?.value).toBeFalse();
    expect(component.searchForm.get('progressRange.min')?.value).toBe(0);
    expect(component.searchForm.get('progressRange.max')?.value).toBe(100);
  });

  it('should load tags on init', () => {
    expect(tagServiceMock.getAllTags).toHaveBeenCalled();
    expect(component.availableTags).toEqual([{ id: 1, name: 'Test Tag' }]);
  });

  it('should emit filters when applyFilters is called', () => {
    spyOn(component.filtersApplied, 'emit');

    component.searchForm.patchValue({
      searchQuery: 'test',
      projectTypes: [ProjectType.RESEARCH],
      tags: [1],
      dateRange: {
        start: new Date('2023-01-01'),
        end: new Date('2023-12-31'),
      },
      status: {
        assigned: true,
        inProgress: true,
      },
      progressRange: {
        min: 10,
        max: 90,
      },
    });

    component.applyFilters();

    const expectedFilters: ProjectSearchFilters = {
      search: 'test',
      types: [ProjectType.RESEARCH],
      tags: ['1'],
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      progressMin: 10,
      progressMax: 90,
      statuses: [ProjectStatus.PENDING, ProjectStatus.IN_PROGRESS],
    };

    expect(component.filtersApplied.emit).toHaveBeenCalledWith(expectedFilters);
  });

  it('should not emit filters when form is invalid', () => {
    spyOn(component.filtersApplied, 'emit');

    component.searchForm.patchValue({
      dateRange: {
        start: new Date('2023-12-31'),
        end: new Date('2023-01-01'),
      },
    });

    component.applyFilters();
    expect(component.filtersApplied.emit).not.toHaveBeenCalled();
  });

  it('should reset form and emit event when resetFilters is called', () => {
    spyOn(component.filtersReset, 'emit');

    component.searchForm.patchValue({
      searchQuery: 'test',
      projectTypes: [ProjectType.RESEARCH],
    });

    component.resetFilters();

    expect(component.searchForm.get('searchQuery')?.value).toBe('');
    expect(component.searchForm.get('projectTypes')?.value).toEqual([]);
    expect(component.filtersReset.emit).toHaveBeenCalled();
  });

  it('should correctly map status checkboxes to status enum values', () => {
    component.searchForm.patchValue({
      status: {
        assigned: true,
        inProgress: false,
        completed: true,
      },
    });

    const statuses = component['getSelectedStatuses'](
      component.searchForm.get('status')?.value
    );
    expect(statuses).toEqual([ProjectStatus.PENDING, ProjectStatus.COMPLETED]);
  });

  it('should format progress label correctly', () => {
    expect(component.formatProgressLabel(50)).toBe('50%');
  });
});
