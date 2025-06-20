import { FormGroup, FormControl } from '@angular/forms';
import { WorkFormPipe } from './work-form.pipe';

describe('WorkFormPipe', () => {
  let pipe: WorkFormPipe;
  let publicationForm: FormGroup;
  let patentForm: FormGroup;
  let researchForm: FormGroup;

  beforeEach(() => {
    pipe = new WorkFormPipe();

    publicationForm = new FormGroup({
      title: new FormControl('Publication'),
    });

    patentForm = new FormGroup({
      title: new FormControl('Patent'),
    });

    researchForm = new FormGroup({
      title: new FormControl('Research'),
    });
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return publicationForm for PUBLICATION type', () => {
    const result = pipe.transform(
      'PUBLICATION',
      publicationForm,
      patentForm,
      researchForm
    );
    expect(result).toBe(publicationForm);
    expect(result.get('title')?.value).toBe('Publication');
  });

  it('should return patentForm for PATENT type', () => {
    const result = pipe.transform(
      'PATENT',
      publicationForm,
      patentForm,
      researchForm
    );
    expect(result).toBe(patentForm);
    expect(result.get('title')?.value).toBe('Patent');
  });

  it('should return researchForm for RESEARCH type', () => {
    const result = pipe.transform(
      'RESEARCH',
      publicationForm,
      patentForm,
      researchForm
    );
    expect(result).toBe(researchForm);
    expect(result.get('title')?.value).toBe('Research');
  });

  it('should default to publicationForm for unknown types', () => {
    const result = pipe.transform(
      'UNKNOWN',
      publicationForm,
      patentForm,
      researchForm
    );
    expect(result).toBe(publicationForm);
  });
});
