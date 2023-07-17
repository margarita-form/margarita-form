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
    return this.field.currentLocale || undefined;
  }

  public get onSubmit(): Observable<this> {
    return this.getStateChanges('submits').pipe(map(() => this));
  }

  public async submit() {
    try {
      await this.validate();
      if (!this.field.handleSubmit && !this.managers.ref.formAction) throw 'Add "handleSubmit" option to submit form!';
      const canSubmit = this.config.allowConcurrentSubmits || !this.state.submitting;
      if (!canSubmit) throw 'Form is already submitting!';
      this.updateStateValue('submitting', true);
      if (this.config.disableFormWhileSubmitting) this.updateStateValue('disabled', true);

      // Handle valid submit
      if (this.state.valid) {
        const validSubmitHandler = this._resolveValidSubmitHandler();
        return await Promise.resolve(validSubmitHandler)
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
            if (this.config.clearStorageOnSuccessfullSubmit) this.extensions.storage.clearStorage();
            return res;
          })
          .catch((error) => {
            this.updateState({ submitResult: 'error', disabled: false });
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
      const invalidSubmitHandler = this._resolveInvalidSubmitHandler();
      return await Promise.resolve(invalidSubmitHandler).finally(() => {
        const submits = this.state.submits || 0;
        this.updateState({
          submitting: false,
          submitted: true,
          submitResult: 'form-invalid',
          disabled: false,
          submits: submits + 1,
        });
      });
    } catch (error) {
      return console.error('Could not handle form submit! Error: ', error);
    }
  }

  private _resolveValidSubmitHandler() {
    if (this.field.handleSubmit?.valid) return Promise.resolve(this.field.handleSubmit.valid<any>(this));

    const action = this.managers.ref.formAction;
    if (!action) throw 'No submit handler for valid submit!';
    return fetch(action, {
      method: 'POST',
      body: JSON.stringify(this.value),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private _resolveInvalidSubmitHandler() {
    if (this.field.handleSubmit?.invalid) return Promise.resolve(this.field.handleSubmit.invalid<any>(this));
    return console.log('Form is invalid!', {
      form: this,
    });
  }
}
