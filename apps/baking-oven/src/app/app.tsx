import styled from 'styled-components';
import {
  MargaritaFormControl,
  useMargaritaForm,
  MargaritaFormArray,
  MargaritaFormGroup,
} from 'margarita-form';

const StyledApp = styled.div`
  // Your style here
`;

export function App() {
  const { form, value } = useMargaritaForm({
    fields: [
      { name: 'hello', initialValue: 'initial value' },
      {
        name: 'world',
        fields: [
          {
            name: 'asd',
          },
        ],
      },
      {
        name: 'others',
        repeatable: true,
        initialValue: [
          {
            lastname: 'asd',
          },
        ],
        fields: [
          {
            name: 'firstname',
          },
          {
            name: 'lastname',
          },
        ],
      },
    ],
  });

  const helloControl = form.getControl<MargaritaFormControl>('hello');
  const worldControl = form.getControl<MargaritaFormGroup>('world');
  const othersControl = form.getControl<MargaritaFormArray>('others');
  const asdControl = worldControl.getControl<MargaritaFormControl>('asd');

  return (
    <StyledApp>
      <h1>{'Hello'}</h1>
      <div>
        <button
          onClick={() => {
            form.setValue({
              hello: Math.random().toString(),
            });
          }}
        >
          update value
        </button>
        <button
          onClick={() => {
            form.register({
              name: 'other',
              initialValue: Math.random(),
            });
          }}
        >
          add field
        </button>
      </div>
      <input type="text" ref={(node) => helloControl.setRef(node)} />

      <input type="text" ref={(node) => worldControl.setRef(node)} />

      {othersControl.controlsArray.map((controls, i) => {
        const firstNameControl = controls.getControl(
          'firstname'
        ) as MargaritaFormControl;

        const lastNameControl = controls.getControl(
          'lastname'
        ) as MargaritaFormControl;

        const muunameControl = controls.getControl(
          'muuname'
        ) as MargaritaFormControl;

        console.log(firstNameControl);

        return (
          <div key={i + 1}>
            {firstNameControl && (
              <input
                type="text"
                placeholder="firstname"
                ref={(node) => firstNameControl.setRef(node)}
              />
            )}
            {lastNameControl && (
              <input
                type="text"
                placeholder="lastname"
                ref={(node) => lastNameControl.setRef(node)}
              />
            )}
            {muunameControl && (
              <input
                type="text"
                placeholder="muuname"
                ref={(node) => muunameControl.setRef(node)}
              />
            )}
          </div>
        );
      })}

      <pre>{JSON.stringify(value, null, 2)}</pre>

      <button onClick={() => othersControl.addControls()}>Add</button>
      <button onClick={() => othersControl.addControls([{ name: 'muuname' }])}>
        Add else
      </button>
      <button onClick={() => othersControl.removeControls(0)}>
        Delete first
      </button>
    </StyledApp>
  );
}

export default App;
