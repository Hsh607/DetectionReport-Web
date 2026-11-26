// src/api/auth.js
import axios from 'axios'

export function login(data) {
    return axios.post('/api/Auth/login', data)   // 加上 /api
}

export function getCurrentUser() {
    return axios.get('/api/Auth/current-user')
}

export function getMenus() {
    return axios.get('/api/Auth/menus')
}

export function getPermissions() {
    return axios.get('/api/Auth/permissions')
}