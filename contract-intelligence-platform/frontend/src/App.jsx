import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ContractProvider } from './context/ContractContext';

function App() {
  return (
    <ContractProvider>
      <RouterProvider router={router} />
    </ContractProvider>
  );
}

export default App;
