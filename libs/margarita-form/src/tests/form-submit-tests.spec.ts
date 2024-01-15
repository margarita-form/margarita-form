import { nanoid } from 'nanoid';
import { MFF, MargaritaForm, createMargaritaForm } from '../index';
import { IncomingMessage, RequestListener, ServerResponse, createServer } from 'http';
import { map } from 'rxjs';

declare module '@margarita-form/core' {
  export interface ControlContext {
    custom: number;
  }
}

const fieldNameInitialValue = 'Hello world';

const commonField: MFF<{ value: string; fields: MFF }> = {
  name: 'fieldName',
  initialValue: fieldNameInitialValue,
};

describe('Form submit testing', () => {
  it('Form submit handler should get current context', async () => {
    const handleSubmit = vitest.fn(({ control, value, params, custom }) => {
      expect(control).toBeInstanceOf(MargaritaForm);
      expect(value).toBe('test');
      expect(params).toBe('params_value');
      expect(custom).toBe(42);
    });

    const form = createMargaritaForm({
      name: nanoid(),
      initialValue: 'test',
      handleSubmit,
      context: {
        custom: 42,
      },
    });

    await form.submit('params_value');

    expect(handleSubmit).toHaveBeenCalled();
  });
  it('Form invalid submit handler should get current context', async () => {
    const valid = vitest.fn(({ control, value, params, custom }) => {
      expect(control).toBeInstanceOf(MargaritaForm);
      expect(value).toBe(undefined);
      expect(params).toBe('params_value');
      expect(custom).toBe(42);
    });
    const invalid = vitest.fn(({ control, value, params, custom }) => {
      expect(control).toBeInstanceOf(MargaritaForm);
      expect(value).toBe(undefined);
      expect(params).toBe('params_value');
      expect(custom).toBe(42);
    });

    const form = createMargaritaForm({
      name: nanoid(),
      handleSubmit: {
        valid,
        invalid,
      },
      context: {
        custom: 42,
      },
      validation: {
        required: true,
      },
    });

    await form.submit('params_value');

    expect(valid).not.toHaveBeenCalled();
    expect(invalid).toHaveBeenCalled();
  });

  it('Check that form submit with post url works', async () => {
    let responseCode = 200;
    let responseText = 'success';

    const listener: RequestListener<typeof IncomingMessage, typeof ServerResponse> = async (req, res) => {
      expect(req.method).toBe('POST');
      expect(req.url).toBe('/api/submit');
      expect(req.headers['content-type']).toBe('application/json');

      await new Promise((resolve) => {
        req.on('data', (chunk) => {
          expect(chunk.toString()).toBe(JSON.stringify({ fieldName: fieldNameInitialValue }));

          resolve(null);
        });
      });

      res.statusCode = responseCode;
      res.setHeader('Content-Type', 'text/plain');
      res.end(responseText);
    };

    const server = createServer(vitest.fn(listener));

    server.listen(4321, () => {
      console.log('Testing server running on port 4321');
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const form = createMargaritaForm<MFF>({
      name: nanoid(),
      fields: [commonField],
      handleSubmit: 'http://localhost:4321/api/submit',
    });

    const commonControl = form.getControl([commonField.name]);
    if (!commonControl) throw 'No control found!';

    expect(form.state.submitting).toBe(false);
    expect(form.state.submits).toBe(0);
    expect(form.state.submitResult).toBe('not-submitted');
    expect(form.state.submitted).toBe(false);
    expect(form.state.disabled).toBe(false);

    const successResponse: Response = await form.submit();
    const successResponseCode = successResponse.status;
    const successResponseText = await successResponse.text();

    expect(successResponseCode).toBe(200);
    expect(successResponseText).toBe('success');

    expect(form.state.submitting).toBe(false);
    expect(form.state.submits).toBe(1);
    expect(form.state.submitResult).toBe('success');
    expect(form.state.submitted).toBe(true);
    expect(form.state.disabled).toBe(true);

    responseCode = 500;
    responseText = 'error';

    const errorResponse: Response = await form.submit();
    const errorResponseCode = errorResponse.status;
    const errorResponseText = await errorResponse.text();

    expect(errorResponseCode).toBe(500);
    expect(errorResponseText).toBe('error');

    expect(form.state.submitting).toBe(false);
    expect(form.state.submits).toBe(2);
    expect(form.state.submitResult).toBe('error');
    expect(form.state.submitted).toBe(true);

    form.cleanup();
  });

  it('Should respect current disabled resolver after submit is done', async () => {
    const form1 = createMargaritaForm<MFF>({
      name: nanoid(),
      handleSubmit: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      },
      disabled: ({ control }) => control.stateChanges.pipe(map((state) => state.submits % 2 === 1)),
    });

    expect(form1.state.disabled).toBe(false);

    await form1.submit();
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(form1.state.disabled).toBe(true);

    await form1.submit();
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(form1.state.disabled).toBe(false);

    await form1.submit();
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(form1.state.disabled).toBe(true);

    const form2 = createMargaritaForm<MFF>({
      name: nanoid(),
      handleSubmit: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      },
      disabled: () => true,
    });

    expect(form2.state.disabled).toBe(true);
    await form2.submit();
    expect(form2.state.disabled).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(form2.state.disabled).toBe(true);
    await form2.submit();
    expect(form2.state.disabled).toBe(true);

    const form3 = createMargaritaForm<MFF>({
      name: nanoid(),
      handleSubmit: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      },
      config: {
        handleSuccesfullSubmit: 'none',
      },
    });

    expect(form3.state.disabled).toBe(false);
    await form3.submit();
    expect(form3.state.disabled).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(form3.state.disabled).toBe(false);

    form3.disable();

    expect(form3.state.disabled).toBe(true);
    await form3.submit();
    expect(form3.state.disabled).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(form3.state.disabled).toBe(true);
  });
});
