import { data } from "autoprefixer";
import axios from "axios";

const API  = axios.create({
    baseURL: 'http://localhost:8000'
})

API.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export const register = (data) => API.post('/auth/register', data)
export const login = (data) => API.post('/auth/login', 
    new URLSearchParams({ username: data.email, password: data.password }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}
)
export const getMe = () => API.get('/auth/me')

export const getTransactions = (params) => API.get('/transactions', { params })
export const createTransaction = (data) => API.post('/transactions', data)
export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data)
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`)

export const getSummary = () => API.get('/dashboard/summary')
export const getByCategory = () => API.get('/dashboard/by-category')
export const getMonthly = () => API.get('/dashboard/monthly')

export const getBudgets = () => API.get('/budget')
export const createBudget = (data) => API.post('/budgets', data)
export const getAIInsights = (data) => API.post('/ai/insights', data)
