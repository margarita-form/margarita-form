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
        grouping: 'repeat-group',
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
      {
        name: 'array',
        grouping: 'array',
        fields: [
          {
            name: 'test1',
            initialValue: 1,
          },
          {
            name: 'test1',
            initialValue: 2,
          },
          {
            name: 'test2',
            initialValue: 3,
          },
          {
            name: 'invalidi',
            initialValue: 4,
          },
        ],
      },
    ],
  });

  const helloControl = form.getControl<MargaritaFormControl>('hello');
  const worldControl = form.getControl<MargaritaFormGroup>('world');
  const asdControl = worldControl.getControl<MargaritaFormControl>('asd');
  const othersControl = form.getControl<MargaritaFormArray>('others');
  const arrayControl = form.getControl<MargaritaFormArray>('array');

  console.log(othersControl);

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
      {helloControl && (
        <input type="text" ref={(node) => helloControl.setRef(node)} />
      )}

      <input
        type="text"
        ref={(node) => asdControl.setRef(node)}
        placeholder="asd"
      />

      {othersControl.controlsArray.map((control, i) => {
        const group = control as MargaritaFormGroup;
        const firstNameControl =
          group.getControl<MargaritaFormControl>('firstname');

        const lastNameControl = group.getControl(
          'lastname'
        ) as MargaritaFormControl;

        const muunameControl = group.getControl(
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

      {arrayControl.controlsArray.map((control, i) => {
        if (control.name === 'test1') {
          return (
            <div key={i + 1}>
              {control && (
                <input
                  type="text"
                  placeholder="test1"
                  ref={(node) => control.setRef(node)}
                />
              )}
            </div>
          );
        }
        if (control.name === 'test2') {
          return (
            <div key={i + 1}>
              {control && (
                <input
                  type="text"
                  placeholder="test2"
                  ref={(node) => control.setRef(node)}
                />
              )}
            </div>
          );
        }

        return (
          <div key={i + 1}>
            {control && (
              <input
                type="text"
                placeholder="joku muu"
                ref={(node) => control.setRef(node)}
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

      <button onClick={() => form.unregister('hello')}>Delete hello</button>
    </StyledApp>
  );
}

export default App;
