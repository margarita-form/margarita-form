/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MFF, MFRF, MargaritaFormOptions } from './margarita-form-types';
import { OptionsManager, getDefaultOptions } from './managers/margarita-form-options-manager';
import { MargaritaFormControl } from './margarita-form-control';
import { Observable, map } from 'rxjs';

export class MargaritaForm<VALUE = unknown, FIELD extends MFF<FIELD> = MFF> extends MargaritaFormControl<VALUE, FIELD> {
  public optionsManager: OptionsManager<typeof this>;

  constructor(public override field: FIELD & MFRF<VALUE>) {
    super(field);
    this.optionsManager = new OptionsManager(this);
  }

  public override get form(): this {
    return this;
  }

  public override get options(): MargaritaFormOptions {
    if (!this.optionsManager) {
      const defaultOptions = getDefaultOptions();
      if (this.field.options) {
        return { ...defaultOptions, ...this.field.options };
      }
      return defaultOptions;
    }
    return this.optionsManager.current;
  }

  public get onSubmit(): Observable<this> {
    return this.getStateChanges('submits').pipe(map(() => this));
  }

  public async submit() {
    await this.validate();
    if (!this.field.handleSubmit) throw 'Add "handleSubmit" option to submit form!';
    const canSubmit = this.options.allowConcurrentSubmits || !this.state.submitting;
    if (!canSubmit) throw 'Form is already submitting!';
    this.updateStateValue('submitting', true);
    if (this.options.disableFormWhileSubmitting) this.updateStateValue('disabled', true);

    // Handle valid submit
    if (this.state.valid) {
      return await Promise.resolve(this.field.handleSubmit.valid<any>(this))
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

    // Handle invalid submit
    if (this.field.handleSubmit?.invalid) {
      return await Promise.resolve(this.field.handleSubmit.invalid<any>(this)).finally(() => {
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

export const createMargaritaForm = <VALUE = unknown, FIELD extends MFF<FIELD> = MFF>(
  field: Partial<FIELD & MFRF<VALUE, FIELD>>
): MargaritaForm<VALUE, FIELD> => {
  if (!field.name) field.name = 'root';
  type ROOTFIELD = FIELD & MFRF<VALUE>;
  return new MargaritaForm<VALUE, FIELD>(field as ROOTFIELD);
};
