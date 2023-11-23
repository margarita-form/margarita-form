import { BaseManager } from './margarita-form-base-manager';
import { MFC } from '../margarita-form-types';
import { getResolverOutput, getResolverOutputPromise } from '../helpers/resolve-function-outputs';
import { SubmitError } from '../classes/submit-error';

// Extends types
declare module './margarita-form-base-manager' {
  export interface Managers {
    events: EventsManager<MFC>;
  }
}

class EventsManager<CONTROL extends MFC = MFC> extends BaseManager {
  public static override managerName = 'events';
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

  public submit = async (params: any) => {
    const { validate, updateStateValue, updateState, reset, managers, field, config, state } = this.control;
    try {
      await validate();
      const { formAction, useNativeSubmit } = managers.ref;
      if (!field.handleSubmit && !formAction && !useNativeSubmit)
        throw 'Add "handleSubmit" option to field or define action to form element to submit the form!';
      const canSubmit = config.allowConcurrentSubmits || !state.submitting;
      if (!canSubmit) throw 'Form is already submitting!';
      updateStateValue('submitting', true);
      if (config.disableFormWhileSubmitting) updateStateValue('disabled', true);

      // Handle valid submit
      if (state.valid || config.allowInvalidSubmit) {
        const handleValidSubmit = async () => {
          try {
            await this._handleBeforeSubmit();
            const submitResponse = await this._resolveValidSubmitHandler(params);
            if (submitResponse instanceof SubmitError) {
              updateState({ submitResult: 'error', disabled: false });
              return submitResponse.value;
            } else {
              updateStateValue('submitResult', 'success');
              switch (config.handleSuccesfullSubmit) {
                case 'disable':
                  updateStateValue('disabled', true);
                  break;
                case 'reset':
                  reset();
                  break;
                default:
                  updateStateValue('disabled', false);
                  break;
              }
              await this._handleAfterSubmit();
              return submitResponse;
            }
          } catch (error) {
            console.error('Could not handle valid submit!', { formName: this.name, error });
            updateState({ submitResult: 'error', disabled: false });
            return error;
          }
        };

        const submitResponse = await handleValidSubmit();
        updateStateValue('submitted', true);
        updateStateValue('submitting', false);
        const submits = state.submits || 0;
        updateStateValue('submits', submits + 1);
        return submitResponse;
      }

      // Handle invalid submit
      const invalidSubmitHandler = this._resolveInvalidSubmitHandler(params);
      return await invalidSubmitHandler.finally(() => {
        const submits = state.submits || 0;
        updateState({
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
  };

  private async _resolveValidSubmitHandler(params: any): Promise<any> {
    const { field, managers } = this.control;
    const { handleSubmit } = field;
    if (!handleSubmit) {
      const action = managers.ref.formAction;
      if (action) return await this._resolveValidSubmitPostHandler(action);
      const useNativeSubmit = managers.ref.useNativeSubmit;
      if (useNativeSubmit) return managers.ref.nativeSubmit();
      throw 'No submit handler for valid submit!';
    }

    if (typeof handleSubmit === 'function') return await Promise.resolve(handleSubmit(this.control, params));

    if (typeof handleSubmit === 'string' && /^http.+|^\/.+/gi.test(handleSubmit))
      return await this._resolveValidSubmitPostHandler(handleSubmit);

    if (typeof handleSubmit === 'object' && handleSubmit.valid) return await Promise.resolve(handleSubmit.valid(this.control, params));

    const resolver = getResolverOutput({ getter: handleSubmit, control: this.control, strict: true });

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

  private async _resolveInvalidSubmitHandler(params: any): Promise<any> {
    const { handleSubmit } = this.control.field;
    const defaultHandler = () => console.log('Form is invalid!', { form: this });
    if (!handleSubmit || typeof handleSubmit === 'string' || typeof handleSubmit === 'function') return defaultHandler();
    if (handleSubmit.invalid) return await Promise.resolve(handleSubmit.invalid(this.control, params));
    return console.log('Form is invalid!', {
      form: this,
    });
  }

  /**
   * @internal
   */
  public _resolveSubmitHandler = async (key: 'beforeSubmit' | 'afterSubmit'): Promise<void> => {
    const { field, controls } = this.control;
    const resolver = getResolverOutput({ getter: field[key], control: this.control });
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
    if (this.control.config.clearStorageOnSuccessfullSubmit) this.control.extensions.storage.clearStorage();
    await this._resolveSubmitHandler('afterSubmit');
  };
}

export { EventsManager };
