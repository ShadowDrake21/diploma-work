import { Component, inject, OnInit } from '@angular/core';
import { projectTags } from '@content/filterProjectTags.content';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormControl,
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
import {
  filterLayout,
  filters,
  quickFilters,
  sorting,
} from '@content/filterPanel.content';
import { MatSlider } from '@angular/material/slider';
import { ProjectService } from '@core/services/project.service';
import { TagService } from '@core/services/tag.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { MatExpansionModule } from '@angular/material/expansion';
import { format, parseISO } from 'date-fns';

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
    MatSlider,
    MatExpansionModule,
  ],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
})
export class FilterPanelComponent implements OnInit {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private tagService = inject(TagService);

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
    if (this.searchForm.invalid) {
      return;
    }

    const formValue = this.searchForm.value;

    const toDateString = (date: Date) =>
      date ? date.toISOString().split('T')[0] : null;

    const filters = {
      search: formValue.searchQuery,
      types: formValue.projectTypes,
      tags: formValue.tags,
      startDate: toDateString(formValue.dateRange.start),
      endDate: toDateString(formValue.dateRange.end),
      assigned: formValue.status.assigned,
      inProgress: formValue.status.inProgress,
      completed: formValue.status.completed,
      progressMin: formValue.progressRange.min,
      progressMax: formValue.progressRange.max,
      publicationSource: formValue.publication.source,
      doiIsbn: formValue.publication.doiIsbn,
      minBudget: formValue.research.minBudget,
      maxBudget: formValue.research.maxBudget,
      fundingSource: formValue.research.fundingSource,
      registrationNumber: formValue.patent.registrationNumber,
      issuingAuthority: formValue.patent.issuingAuthority,
    };

    this.projectService.searchProjects(filters).subscribe((projects) => {
      console.log('Filtered projects:', projects);
    });
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
