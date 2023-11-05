import styled from 'styled-components';
import { useMargaritaForm, MargaritaFormField, Form, MFC, MargaritaFormControl } from '@margarita-form/react';
import { useState } from 'react';
import { recipeConfig } from './fields/receipe';
import { websiteConfig } from './fields/website';
import { CustomManager } from './managers/custom-manager';
import { ControlError } from './components/error';
import { lifecycleConfig } from './fields/lifecycle';
import { conditionalsConfig } from './fields/conditionals';

MargaritaFormControl.addManager('custom', CustomManager);

const AppWrapper = styled.div`
  font-family: Arial, sans-serif;
  padding: 10vw;
  display: grid;
  justify-content: center;
  justify-items: start;
  grid-template-columns: 1fr 1fr;
  width: fit-content;
  gap: 50px;
  margin: auto;
  form {
    min-width: clamp(500px, 25vw, 720px);
    display: grid;
    gap: 10px;
    input,
    textarea {
      font-family: Arial, sans-serif;
      padding: 0.5em;
    }
    .field-wrapper {
      display: grid;
      gap: 4px;
      &.repeatable {
        gap: 10px;
      }
      h2,
      h3,
      h4 {
        margin: 0;
      }
    }
    .locales-fields {
      display: grid;
      gap: 10px;
      border-left: 1px solid #ccc;
      padding: 0 10px;
      margin: 10px 0;
    }
    .step-container {
      display: grid;
      gap: 10px;
      grid-template-columns: 1fr max-content;
      padding: 10px;
      border: 1px solid #ccc;
      button {
        height: fit-content;
      }
      .step-fields {
        grid-column: 1 / -1;
        display: grid;
        gap: 10px;
      }
    }
    hr {
      width: 100%;
    }
  }
  pre {
    width: 100%;
    padding: 20px;
    background: #f8f8f8;
    height: fit-content;
    min-height: 100px;
    max-height: 80vh;
    overflow: auto;
    box-sizing: border-box;
    margin: 0;
    position: sticky;
    top: 20px;
  }
`;

interface I18NContent {
  description?: string;
}

export interface CustomFieldBase {
  type: 'text' | 'number' | 'textarea' | 'radio' | 'checkbox' | 'checkbox-group' | 'repeatable' | 'group' | 'localized' | 'localized-array';
  title: string;
  options?: { label: string; value: string }[];
}

const locales = ['en', 'fi'] as const;
type Locales = (typeof locales)[number];

export interface ConditionalsField extends CustomFieldBase, MargaritaFormField<unknown, GroupField, Locales, I18NContent> {}

export interface GroupField extends CustomFieldBase, MargaritaFormField<unknown, CustomField, Locales, I18NContent> {}

export interface StepsField extends CustomFieldBase, MargaritaFormField<unknown, OtherField, Locales, I18NContent> {}

export interface OtherField extends CustomFieldBase, MargaritaFormField<unknown, StepsField, Locales, I18NContent> {}

export type CustomField = StepsField | OtherField;

type FormValue = Record<string, unknown>;

type RootField = MargaritaFormField<FormValue, CustomField, Locales>;

export function App() {
  const [submitResponse, setSubmitResponse] = useState<string | null>(null);
  const [currentFields, setCurrentFields] = useState(recipeConfig);
  const [shouldReset, setShouldReset] = useState(true);

  const form = useMargaritaForm<RootField>({
    ...currentFields,
    localize: true,
    locales,
    useStorage: 'localStorage',
    useSyncronization: 'broadcastChannel',
    handleLocalize: {
      parent: () => {
        return {
          type: 'localized',
        };
      },
      child: ({ locale }) => {
        return {
          title: locale.toUpperCase(),
        };
      },
    },
    handleSubmit: {
      valid: async (form) => {
        setSubmitResponse('Fake submitting for 1s...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Valid submit', { form });
        setSubmitResponse('Form is valid!');
      },
      invalid: async (form) => {
        setSubmitResponse('Fake submitting for 1s...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Invalid submit', { form });
        setSubmitResponse('Form is invalid!');
      },
    },
    config: {
      resetFormOnFieldChanges: shouldReset,
      handleSuccesfullSubmit: 'enable',
      requiredNameCase: 'camel',
    },
  });

  // console.log('Rendering form', form.uid);

  return (
    <AppWrapper>
      <div className="form-wrapper">
        <Form form={form}>
          <p>
            Form uid: <strong>{form.uid}</strong>
          </p>
          <h2>Config</h2>

          <div>
            <input
              type="checkbox"
              id="should-reset"
              name="should-reset"
              checked={shouldReset}
              onChange={(e) => {
                setShouldReset(e.target.checked);
              }}
            />
            <label htmlFor="should-reset">Form should reset on field changes?</label>
          </div>

          <hr />

          <div className="change-fields-wrapper">
            <h2>Change fields</h2>
            <button
              type="button"
              onClick={() => {
                setCurrentFields(recipeConfig);
              }}
            >
              Recipe fields
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentFields(websiteConfig);
              }}
            >
              Website fields
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentFields(lifecycleConfig);
              }}
            >
              Lifecycle testing fields
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentFields(conditionalsConfig);
              }}
            >
              Conditionals fields
            </button>
          </div>

          <hr />

          <h2>Fields</h2>

          {form.activeControls.map((control) => (
            <FormField key={control.key} control={control} />
          ))}

          <hr />

          <button type="submit">Submit</button>

          <hr />

          <button type="button" onClick={() => form.reset()}>
            Reset
          </button>

          {submitResponse && <span>{submitResponse}</span>}
        </Form>
      </div>
      <pre>{JSON.stringify(form.value, null, 2)}</pre>
    </AppWrapper>
  );
}

interface FormFieldProps {
  control: MFC<CustomField>;
}

const FormField = ({ control }: FormFieldProps) => {
  const uid = control.name + '-' + control.key;

  switch (control.field.type) {
    case 'textarea':
      return (
        <div className="field-wrapper">
          <label htmlFor={uid}>{control.field.title}</label>
          {control.i18n && <p>{control.i18n.description}</p>}
          <textarea id={uid} name={uid} ref={control.setRef} />
          <ControlError control={control} />
        </div>
      );

    case 'radio':
      return (
        <div className="field-wrapper">
          <h3>{control.field.title}</h3>
          {control.field.options?.map((option) => {
            return (
              <div key={option.value}>
                <input id={uid + '-' + option.value} name={uid} type="radio" value={option.value} ref={control.setRef} />
                <label htmlFor={uid + '-' + option.value}>{option.label}</label>
              </div>
            );
          })}
          <ControlError control={control} />
        </div>
      );

    case 'checkbox':
      return (
        <div className="field-wrapper">
          <label htmlFor={uid}>{control.field.title}</label>
          <input id={uid} name={uid} type="checkbox" ref={control.setRef} />
          <ControlError control={control} />
        </div>
      );

    case 'checkbox-group':
      return (
        <div className="field-wrapper">
          <h3>{control.field.title}</h3>
          {control.field.options?.map((option) => {
            return (
              <div key={option.value}>
                <input id={uid + '-' + option.value} name={uid} type="checkbox" multiple value={option.value} ref={control.setRef} />
                <label htmlFor={uid + '-' + option.value}>{option.label}</label>
              </div>
            );
          })}
          <ControlError control={control} />
        </div>
      );

    case 'localized':
      return (
        <div className="field-wrapper">
          <h3>{control.field.title}</h3>
          <div className="locales-fields">
            {control.activeControls.map((localeControl) => {
              return <FormField key={localeControl.key} control={localeControl} />;
            })}
          </div>
          <ControlError control={control} />
        </div>
      );

    case 'localized-array':
      return (
        <div className="field-wrapper">
          <h3>{control.field.title}</h3>
          <div className="locales-fields">
            {control.activeControls.map((localeControl) => {
              return <FormField key={localeControl.key} control={localeControl} />;
            })}
          </div>
          <ControlError control={control} />
        </div>
      );

    case 'group':
      return (
        <div className="field-wrapper">
          <h3>{control.field.title}</h3>
          <div className="locales-fields">
            {control.activeControls.map((localeControl) => {
              return <FormField key={localeControl.key} control={localeControl} />;
            })}
          </div>
          <ControlError control={control} />
        </div>
      );

    case 'repeatable':
      return (
        <div className="field-wrapper repeatable">
          <h3>{control.field.title}</h3>

          {control.activeControls.map((childGroup) => {
            return (
              <div className="step-container" key={childGroup.uid}>
                <h3>
                  {childGroup.field.title}: {childGroup.index + 1} ({childGroup.key} & {childGroup.uid})
                </h3>

                <button
                  type="button"
                  onClick={() => {
                    childGroup.remove();
                  }}
                >
                  Delete
                </button>

                <div className="step-fields">
                  {childGroup.expectChildControls ? (
                    childGroup.activeControls.map((control) => <FormField key={control.key} control={control} />)
                  ) : (
                    <FormField control={childGroup} />
                  )}
                </div>
              </div>
            );
          })}

          {control.field.fields?.map((field) => {
            return (
              <button
                key={field.name}
                type="button"
                onClick={() => {
                  control.appendControl(field.name);
                }}
              >
                Add new {field.title}
              </button>
            );
          })}
          <ControlError control={control} />
        </div>
      );

    default:
      if (['text', 'number'].includes(control.field.type)) {
        return (
          <div className="field-wrapper">
            <label htmlFor={uid}>{control.field.title}</label>
            {control.i18n?.description && <p>{control.i18n.description}</p>}
            <input id={uid} name={uid} type={control.field.type} ref={control.setRef} />
            <ControlError control={control} />
          </div>
        );
      }
      return <p>Unknown field type: {control.field.type}</p>;
  }
};

export default App;
