import { BaseManager, ManagerName } from './base-manager';
import { MFC, ControlContext, MargaritaFormSubmitHandler } from '../typings/margarita-form-types';
import { resolve, getResolverOutputPromise } from '../helpers/resolve-function-outputs';
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
    this.createSubscription(this.control.changes, ({ name, control }) => {
      const { onChanges, onValueChanges, onStateChanges } = control.field;
      if (onChanges) resolve({ getter: onChanges, control, contextData: { params: name } });
      if (name === 'value' && onValueChanges) resolve({ getter: onValueChanges, control });
      if (name === 'state' && onStateChanges) resolve({ getter: onStateChanges, control });
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
      const { disabled: disabledBeforeSubmit } = state;
      if (disableFormWhileSubmitting && !disabledBeforeSubmit) await updateStateValue('disabled', true);

      // Handle valid submit
      if (state.valid || config.allowInvalidSubmit) {
        const handleValidSubmit = async () => {
          try {
            await this._handleBeforeSubmit();
            const submitOutput = await this._resolveValidSubmit(params);
            if (submitOutput instanceof SubmitError) {
              await updateState({ submitResult: 'error', disabled: false });
              return submitOutput.value;
            } else {
              await updateStateValue('submitResult', 'success');
              if (disableFormWhileSubmitting && handleSuccesfullSubmit !== 'disable' && !disabledBeforeSubmit) enable();
              switch (handleSuccesfullSubmit) {
                case 'disable':
                  await updateStateValue('disabled', true);
                  break;
                case 'enable':
                  await updateStateValue('disabled', false);
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
      const submitOutput = await this._resolveInvalidSubmit(params);
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

  private async _handleSubmitResolution<T>(submitHandler: string | MargaritaFormSubmitHandler<any>, params: T) {
    const context = this.control.generateContext(params) as ControlContext<any>;
    if (typeof submitHandler === 'function') return await Promise.resolve(submitHandler(context));
    if (typeof submitHandler === 'string' && /^http.+|^\/.+/gi.test(submitHandler)) return await this._resolvePostHandler(submitHandler);
    const resolver = resolve({ getter: submitHandler, control: this.control, strict: true });
    if (resolver) return await getResolverOutputPromise('handleSubmit', resolver, this.control);
    console.error('Submit handler is invalid!', { submit: submitHandler, context });
    throw 'Submit handler is invalid!';
  }

  private async _resolveValidSubmit<T>(params: T): Promise<any> {
    const { field, managers } = this.control;
    const { handleSubmit } = field;
    if (!handleSubmit) {
      const action = managers.ref.formAction;
      if (action) return await this._resolvePostHandler(action);
      const useNativeSubmit = managers.ref.useNativeSubmit;
      if (useNativeSubmit) return managers.ref.nativeSubmit();
      throw 'No submit handler for valid submit!';
    }
    if (typeof handleSubmit === 'object' && handleSubmit) return this._handleSubmitResolution(handleSubmit.valid, params);
    return this._handleSubmitResolution(handleSubmit, params);
  }

  private async _resolveInvalidSubmit<T>(params: T): Promise<any> {
    const { handleSubmit } = this.control.field;
    const defaultHandler = () => console.log('Form is invalid!', { form: this });
    if (!handleSubmit || typeof handleSubmit === 'string' || typeof handleSubmit === 'function') return defaultHandler();
    if (handleSubmit.invalid) return await this._handleSubmitResolution(handleSubmit.invalid, params);
    return console.log('Form is invalid!', { form: this });
  }

  private async _resolvePostHandler(url: string) {
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

  /**
   * @internal
   */
  public _resolveSubmitHandler = async (key: 'beforeSubmit' | 'afterSubmit'): Promise<void> => {
    const { field, controls } = this.control;
    const resolver = resolve({ getter: field[key], control: this.control });
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
