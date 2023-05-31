import type { MFF, MFRF, MargaritaFormConfig } from './margarita-form-types';
import { getDefaultConfig } from './managers/margarita-form-config-manager';
import { MargaritaFormControl } from './margarita-form-control';
import { Observable, map } from 'rxjs';

export class MargaritaForm<VALUE = unknown, FIELD extends MFF<FIELD> = MFF> extends MargaritaFormControl<VALUE, FIELD> {
  constructor(public override field: FIELD & MFRF<VALUE>) {
    super(field, {});
    this.managers.value._syncChildValues(false, true);
  }

  public override get form(): this {
    return this;
  }

  public override get locales(): undefined | string[] {
    return this.field.locales;
  }

  public override get currentLocale(): undefined | string {
    return this.field.locale || undefined;
  }

  public override get config(): MargaritaFormConfig {
    if (!this.managers.config) {
      const defaultConfig = getDefaultConfig();
      if (this.field.config) {
        return { ...defaultConfig, ...this.field.config };
      }
      return defaultConfig;
    }
    return this.managers.config.current;
  }

  public get onSubmit(): Observable<this> {
    return this.getStateChanges('submits').pipe(map(() => this));
  }

  public async submit() {
    await this.validate();
    if (!this.field.handleSubmit) throw 'Add "handleSubmit" option to submit form!';
    const canSubmit = this.config.allowConcurrentSubmits || !this.state.submitting;
    if (!canSubmit) throw 'Form is already submitting!';
    this.updateStateValue('submitting', true);
    if (this.config.disableFormWhileSubmitting) this.updateStateValue('disabled', true);

    // Handle valid submit
    if (this.state.valid) {
      return await Promise.resolve(this.field.handleSubmit.valid<any>(this))
        .then((res) => {
          this.updateStateValue('submitResult', 'success');
          switch (this.config.handleSuccesfullSubmit) {
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
          if (this.config.clearStorageOnSuccessfullSubmit) this.managers.value.clearStorageValue();
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
