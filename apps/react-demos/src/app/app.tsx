import { Route, Routes } from 'react-router-dom';
import { CustomForm as ReadmeExample } from './readme-example/readme-example';

export function App() {
  return (
    <div className="app-wrapper">
      <header>
        <h1>Margarita form / React demos</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<ReadmeExample />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
