import { nanoid } from 'nanoid';
import { MargaritaFormControl, createMargaritaForm } from '../light';

describe('Config manager testing', () => {
  it('should create form with default, global, parent and field config included', async () => {
    MargaritaFormControl.setGlobalConfig({
      afterChangesDebounceTime: 123,
    });

    const form = createMargaritaForm({
      name: nanoid(),
      config: {
        allowUnresolvedArrayChildNames: true,
        asyncFunctionWarningTimeout: 123,
      },
      fields: [
        {
          name: 'childField',
          config: {
            allowConcurrentSubmits: true,
            asyncFunctionWarningTimeout: 1234,
          },
        },
      ],
    });

    const childControl = form.getControl('childField');

    expect(childControl.config.addMetadata).toBe(false);
    expect(childControl.config.afterChangesDebounceTime).toBe(123);
    expect(childControl.config.allowUnresolvedArrayChildNames).toBe(true);
    expect(childControl.config.allowConcurrentSubmits).toBe(true);

    expect(form.config.asyncFunctionWarningTimeout).toBe(123);
    expect(childControl.config.asyncFunctionWarningTimeout).toBe(1234);
  });
});
