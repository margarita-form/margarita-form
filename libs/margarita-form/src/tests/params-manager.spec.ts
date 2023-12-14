import { nanoid } from 'nanoid';
import { Param, createMargaritaForm } from '../index';

describe('Custom params testing', () => {
  it('should create form with custom params', async () => {
    const form = createMargaritaForm({
      name: nanoid(),
      someCustomParam: new Param(Promise.resolve('async value'), 'snapshot value'),
      initialValue: 'initial-value',
      params: {
        staticParam: 'static value',
        otherCustomParam: new Param(Promise.resolve('also async value'), 'also snapshot value'),
        alwaysSyncParam: new Param('sync value'),
        controlNameResolver: new Param(({ control }) => control.name),
        controlValueChangesResolver: new Param(({ control }) => control.valueChanges, 'not-set'),
        controlValueChangesDoubleTroubleResolver: new Param(
          ({ control }) => control.valueChanges,
          ({ control }) => control.value
        ),
      },
    });

    expect(form.params['someCustomParam']).toBe('snapshot value');
    expect(form.params['staticParam']).toBe('static value');
    expect(form.params['otherCustomParam']).toBe('also snapshot value');
    expect(form.params['alwaysSyncParam']).toBe('sync value');
    expect(form.params['controlNameResolver']).toBe(form.name);
    expect(form.params['controlValueChangesResolver']).toBe('not-set');
    expect(form.params['controlValueChangesDoubleTroubleResolver']).toBe('initial-value');

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(form.params['someCustomParam']).toBe('async value');
    expect(form.params['staticParam']).toBe('static value');
    expect(form.params['otherCustomParam']).toBe('also async value');
    expect(form.params['alwaysSyncParam']).toBe('sync value');
    expect(form.params['controlNameResolver']).toBe(form.name);
    expect(form.params['controlValueChangesResolver']).toBe('initial-value');
    expect(form.params['controlValueChangesDoubleTroubleResolver']).toBe('initial-value');

    form.setValue('new-value');
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(form.params['controlValueChangesResolver']).toBe('new-value');
    expect(form.params['controlValueChangesDoubleTroubleResolver']).toBe('new-value');
  });
});
