import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProjectService } from '@core/services/project.service';
import { TagService } from '@core/services/tag.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { MatExpansionModule } from '@angular/material/expansion';
import { ProjectSearchFilters } from '@shared/types/search.types';
import { ProjectStatus } from '@shared/enums/project.enums';

@Component({
  selector: 'profile-filter-panel',
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatExpansionModule,
  ],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
})
export class FilterPanelComponent implements OnInit {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private tagService = inject(TagService);

  @Output() filtersApplied = new EventEmitter<any>();
  @Output() filtersReset = new EventEmitter<void>();

  availableTags: any[] = [];
  projectTypes = Object.values(ProjectType);
  searchForm!: FormGroup;

  constructor() {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadTags();
  }

  private initForms(): void {
    this.searchForm = this.fb.group({
      searchQuery: [''],
      projectTypes: [[]],
      tags: [[]],
      dateRange: this.fb.group({
        start: [null],
        end: [null],
      }),
      status: this.fb.group({
        assigned: [false],
        inProgress: [false],
        completed: [false],
      }),
      progressRange: this.fb.group({
        min: [0],
        max: [100],
      }),
      publication: this.fb.group({
        source: [''],
        doiIsbn: [''],
      }),
      patent: this.fb.group({
        registrationNumber: [''],
        issuingAuthority: [''],
      }),
      research: this.fb.group({
        minBudget: [null],
        maxBudget: [null],
        fundingSource: [''],
      }),
    });
  }

  get formControls() {
    return this.searchForm.controls;
  }

  get statusControls() {
    return (this.searchForm.get('status') as FormGroup).controls;
  }

  get progressRangeControls() {
    return (this.searchForm.get('progressRange') as FormGroup).controls;
  }

  get publicationControls() {
    return (this.searchForm.get('publication') as FormGroup).controls;
  }

  get patentControls() {
    return (this.searchForm.get('patent') as FormGroup).controls;
  }

  get researchControls() {
    return (this.searchForm.get('research') as FormGroup).controls;
  }

  private loadTags(): void {
    this.tagService.getAllTags().subscribe((tags) => {
      this.availableTags = tags;
    });
  }

  applyFilters(): void {
    if (this.searchForm.invalid) return;

    const formValue = this.searchForm.value;
    const statuses = this.getSelectedStatuses(formValue.status);

    const filters: ProjectSearchFilters = {
      search: formValue.searchQuery || undefined,
      types: formValue.projectTypes?.length
        ? formValue.projectTypes
        : undefined,
      tags: formValue.tags?.length ? formValue.tags : undefined,
      startDate: formValue.dateRange.start?.toISOString().split('T')[0],
      endDate: formValue.dateRange.end?.toISOString().split('T')[0],
      progressMin:
        formValue.progressRange.min !== 0
          ? formValue.progressRange.min
          : undefined,
      progressMax:
        formValue.progressRange.max !== 100
          ? formValue.progressRange.max
          : undefined,
      publicationSource: formValue.publication.source || undefined,
      doiIsbn: formValue.publication.doiIsbn || undefined,
      minBudget: formValue.research.minBudget || undefined,
      maxBudget: formValue.research.maxBudget || undefined,
      fundingSource: formValue.research.fundingSource || undefined,
      registrationNumber: formValue.patent.registrationNumber || undefined,
      issuingAuthority: formValue.patent.issuingAuthority || undefined,
      statuses: statuses.length ? statuses : undefined,
    };

    this.filtersApplied.emit(filters);
  }

  private getSelectedStatuses(statusGroup: any): ProjectStatus[] {
    const statuses: ProjectStatus[] = [];
    if (statusGroup.assigned) statuses.push(ProjectStatus.PENDING);
    if (statusGroup.inProgress) statuses.push(ProjectStatus.IN_PROGRESS);
    if (statusGroup.completed) statuses.push(ProjectStatus.COMPLETED);
    return statuses;
  }

  resetFilters(): void {
    this.searchForm.reset({
      searchQuery: '',
      projectTypes: [],
      tags: [],
      dateRange: { start: null, end: null },
      status: {
        inProgress: false,
        completed: false,
        pending: false,
      },
      progressRange: {
        min: 0,
        max: 100,
      },
      publication: {
        source: '',
        doiIsbn: '',
      },
      research: {
        minBudget: null,
        maxBudget: null,
        fundingSource: '',
      },
      patent: {
        registrationNumber: '',
        issuingAuthority: '',
      },
    });
  }

  formatProgressLabel(value: number): string {
    return `${value}%`;
  }
}
