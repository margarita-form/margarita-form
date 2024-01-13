import { BaseManager, ManagerName } from './base-manager';
import { MFC, MargaritaFormControlContext } from '../typings/margarita-form-types';
import { resolveOutput, getResolverOutputPromise } from '../helpers/resolve-function-outputs';
import { SubmitError } from '../classes/submit-error';

// Extends types
declare module '../typings/expandable-types' {
  export interface Managers {
    events: EventsManager<MFC>;
  }
}

class EventsManager<CONTROL extends MFC = MFC> extends BaseManager {
  public static override managerName: ManagerName = 'events';
  constructor(public override control: CONTROL) {
    super(control);
  }

  public override afterInitialize(): void {
    this.createSubscription(this.control.changes, ({ name, change: value, control }) => {
      const { onChanges, onValueChanges, onStateChanges } = control.field;
      if (onChanges) onChanges({ control, value, params: name });
      if (name === 'value' && onValueChanges) onValueChanges({ control, value });
      if (name === 'state' && onStateChanges) onStateChanges({ control, value });
    });
  }

  public submit = async <T>(params?: T) => {
    const { validate, updateStateValue, updateState, reset, resetValue, resetState, enable, managers, field, config, state } = this.control;
    try {
      await validate();
      const { formAction, useNativeSubmit } = managers.ref;
      if (!field.handleSubmit && !formAction && !useNativeSubmit)
        throw 'Add "handleSubmit" option to field or define action to form element to submit the form!';
      const { allowConcurrentSubmits, disableFormWhileSubmitting, handleSuccesfullSubmit } = config;
      const canSubmit = allowConcurrentSubmits || !state.submitting;
      if (!canSubmit) throw 'Form is already submitting!';
      await updateStateValue('submitting', true);
      if (disableFormWhileSubmitting) await updateStateValue('disabled', true);

      // Handle valid submit
      if (state.valid || config.allowInvalidSubmit) {
        const handleValidSubmit = async () => {
          try {
            await this._handleBeforeSubmit();
            const submitOutput = await this._resolveValidSubmitHandler(params);
            if (submitOutput instanceof SubmitError) {
              await updateState({ submitResult: 'error', disabled: false });
              return submitOutput.value;
            } else {
              await updateStateValue('submitResult', 'success');
              if (disableFormWhileSubmitting && handleSuccesfullSubmit !== 'disable') enable();
              switch (handleSuccesfullSubmit) {
                case 'disable':
                  await updateStateValue('disabled', true);
                  break;
                case 'reset':
                  reset();
                  break;
                case 'reset-value':
                  resetValue();
                  break;
                case 'reset-state':
                  resetState();
                  break;
              }
              await this._handleAfterSubmit();
              return submitOutput;
            }
          } catch (error) {
            console.error('Could not handle valid submit!', { formName: this.control.name, error });
            await updateState({ submitResult: 'error', disabled: false });
            return error;
          }
        };

        const submitOutput = await handleValidSubmit();
        const submits = state.submits || 0;
        await updateState({
          submitted: true,
          submitting: false,
          submits: submits + 1,
          submitOutput,
        });
        this.emitChange({
          event: 'submit',
          state: this.control.state,
        });
        return submitOutput;
      }

      // Handle invalid submit
      const submitOutput = await this._resolveInvalidSubmitHandler(params);
      const submits = state.submits || 0;
      await updateState({
        submitting: false,
        submitted: true,
        submitResult: 'form-invalid',
        disabled: false,
        submits: submits + 1,
        submitOutput,
      });
      this.emitChange({
        event: 'submit',
        state: this.control.state,
      });
      return submitOutput;
    } catch (error) {
      return console.error('Could not handle form submit! Error: ', error);
    }
  };

  private async _resolveValidSubmitHandler<T>(params: T): Promise<any> {
    const { field, managers } = this.control;
    const { handleSubmit } = field;
    if (!handleSubmit) {
      const action = managers.ref.formAction;
      if (action) return await this._resolveValidSubmitPostHandler(action);
      const useNativeSubmit = managers.ref.useNativeSubmit;
      if (useNativeSubmit) return managers.ref.nativeSubmit();
      throw 'No submit handler for valid submit!';
    }

    const context = this.control.generateContext(params) as MargaritaFormControlContext<any>;

    if (typeof handleSubmit === 'function') return await Promise.resolve(handleSubmit(context));

    if (typeof handleSubmit === 'string' && /^http.+|^\/.+/gi.test(handleSubmit))
      return await this._resolveValidSubmitPostHandler(handleSubmit);

    if (typeof handleSubmit === 'object' && handleSubmit.valid) return await Promise.resolve(handleSubmit.valid(context));

    const resolver = resolveOutput({ getter: handleSubmit, control: this.control, strict: true });

    if (resolver) return await getResolverOutputPromise('handleSubmit', resolver, this.control);

    throw 'Submit handler (handleSubmit) is invalid!';
  }

  private async _resolveValidSubmitPostHandler(url: string) {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(this.control.value),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) return new SubmitError('error-on-submit', response);
    return response;
  }

  private async _resolveInvalidSubmitHandler<T>(params: T): Promise<any> {
    const { handleSubmit } = this.control.field;
    const context = this.control.generateContext(params) as MargaritaFormControlContext<any>;
    const defaultHandler = () => console.log('Form is invalid!', { form: this });
    if (!handleSubmit || typeof handleSubmit === 'string' || typeof handleSubmit === 'function') return defaultHandler();
    if (handleSubmit.invalid) return await Promise.resolve(handleSubmit.invalid(context));
    return console.log('Form is invalid!', {
      form: this,
    });
  }

  /**
   * @internal
   */
  public _resolveSubmitHandler = async (key: 'beforeSubmit' | 'afterSubmit'): Promise<void> => {
    const { field, controls } = this.control;
    const resolver = resolveOutput({ getter: field[key], control: this.control });
    if (resolver) await getResolverOutputPromise(key, resolver, this.control);
    const childHandlers = controls.map((control) => {
      const eventsManager = control.managers.events;
      if (key === 'beforeSubmit') return eventsManager._handleBeforeSubmit();
      if (key === 'afterSubmit') return eventsManager._handleAfterSubmit();
      return eventsManager._resolveSubmitHandler(key);
    });
    await Promise.all(childHandlers);
  };
  /**
   * @internal
   */
  public _handleBeforeSubmit = async () => {
    await this._resolveSubmitHandler('beforeSubmit');
  };

  /**
   * @internal
   */
  public _handleAfterSubmit = async () => {
    this.control.activeExtensions.forEach(({ afterSubmit }) => {
      if (afterSubmit) afterSubmit(this.control);
    });
    await this._resolveSubmitHandler('afterSubmit');
  };
}

export { EventsManager };
