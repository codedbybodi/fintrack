import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import AIInsighs from './pages/AIInsights'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />}/>
        <Route path='/' element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path='transactions' element={<Transactions />}></Route>
          <Route path='budgets' element={<Budgets />}></Route>
          <Route path='ai' element={<AIInsighs />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
