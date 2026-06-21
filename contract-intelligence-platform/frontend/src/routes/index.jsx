import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Contracts from '../pages/Contracts';
import ContractDetail from '../pages/ContractDetail';
import Upload from '../pages/Upload';
import Compare from '../pages/Compare';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ResetPassword from '../pages/ResetPassword';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'upload',
        element: <Upload />
      },
      {
        path: 'contracts',
        element: <Contracts />
      },
      {
        path: 'contracts/:id',
        element: <ContractDetail />
      },
      {
        path: 'compare',
        element: <Compare />
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]);
