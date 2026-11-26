// src/api/rbac.js
import axios from 'axios'

// ========== 用户管理 ==========
export function getUsers(params) {
    return axios.get('/api/RBAC/users', { params })
}

export function addUser(data) {
    return axios.post('/api/RBAC/users', data)
}

export function updateUser(id, data) {
    return axios.put(`/api/RBAC/users/${id}`, data)
}

export function deleteUser(id) {
    return axios.delete(`/api/RBAC/users/${id}`)
}

// ========== 角色管理 ==========
export function getRoles() {
    return axios.get('/api/RBAC/roles')
}

export function addRole(data) {
    return axios.post('/api/RBAC/roles', data)
}

export function updateRole(id, data) {
    return axios.put(`/api/RBAC/roles/${id}`, data)
}

export function deleteRole(id) {
    return axios.delete(`/api/RBAC/roles/${id}`)
}

// ========== 权限管理 ==========
export function getPermissions() {
    return axios.get('/api/RBAC/permissions')
}

export function addPermission(data) {
    return axios.post('/api/RBAC/permissions', data)
}

export function updatePermission(id, data) {
    return axios.put(`/api/RBAC/permissions/${id}`, data)
}

export function deletePermission(id) {
    return axios.delete(`/api/RBAC/permissions/${id}`)
}

// ========== 菜单管理 ==========
export function getMenus() {
    return axios.get('/api/RBAC/menus')
}

export function addMenu(data) {
    return axios.post('/api/RBAC/menus', data)
}

export function updateMenu(id, data) {
    return axios.put(`/api/RBAC/menus/${id}`, data)
}

export function deleteMenu(id) {
    return axios.delete(`/api/RBAC/menus/${id}`)
}

// 分配菜单
export function assignMenus(roleId, menuIds) {
    return axios.put(`/api/RBAC/roles/${roleId}/menus`, menuIds)
}

//  重置用户密码（管理员）
export function resetUserPassword(userId) {
    return axios.post(`/api/user/reset-password/${userId}`)
}