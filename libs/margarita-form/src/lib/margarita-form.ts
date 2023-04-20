import type {
  MargaritaFormOptions,
  MargaritaFormRootField,
} from './margarita-form-types';
import { OptionsManager } from './managers/margarita-form-options-manager';
import { MargaritaFormControl } from './margarita-form-control';
import { Observable, map } from 'rxjs';

export class MargaritaForm<
  VALUE = unknown,
  FIELD extends MargaritaFormRootField = MargaritaFormRootField
> extends MargaritaFormControl<VALUE, FIELD> {
  public optionsManager: OptionsManager<typeof this>;
  constructor(public override field: FIELD) {
    super(field);
    this.optionsManager = new OptionsManager(this);
  }

  public override get form(): this {
    return this;
  }

  public override get options(): MargaritaFormOptions {
    return this.optionsManager.current;
  }

  public get onSubmit(): Observable<this> {
    return this.getStateChanges('submits').pipe(map(() => this));
  }

  public async submit() {
    await this.validate();
    if (!this.field.handleSubmit)
      throw 'Add "handleSubmit" option to submit form!';
    const canSubmit =
      this.options.allowConcurrentSubmits || !this.state.submitting;
    if (!canSubmit) throw 'Form is already submitting!';
    this.updateStateValue('submitting', true);
    if (this.options.disableFormWhileSubmitting)
      this.updateStateValue('disabled', true);
    if (this.state.valid) {
      return await Promise.resolve(this.field.handleSubmit.valid<this>(this))
        .then((res) => {
          this.updateStateValue('submitResult', 'success');
          switch (this.options.handleSuccesfullSubmit) {
            case 'disable':
              this.updateStateValue('disabled', true);
              break;
            case 'reset':
              this.reset();
              break;
            default:
              this.updateStateValue('disabled', false);
              break;
          }
          return res;
        })
        .catch((error) => {
          this.updateStateValue('submitResult', 'error');
          return error;
        })
        .finally(() => {
          this.updateStateValue('submitted', true);
          this.updateStateValue('submitting', false);
          const submits = this.state.submits || 0;
          this.updateStateValue('submits', submits + 1);
        });
    }
    if (this.field.handleSubmit?.invalid) {
      return await Promise.resolve(
        this.field.handleSubmit.invalid<this>(this)
      ).finally(() => {
        const submits = this.state.submits || 0;
        this.updateState({
          submitting: false,
          submitted: true,
          submitResult: 'form-invalid',
          disabled: false,
          submits: submits + 1,
        });
      });
    }
    throw 'Could not handle form submit!';
  }
}

export const createMargaritaForm = <
  VALUE = unknown,
  FIELD extends MargaritaFormRootField = MargaritaFormRootField
>(
  field: FIELD
): MargaritaForm<VALUE, FIELD> => {
  return new MargaritaForm(field);
};
