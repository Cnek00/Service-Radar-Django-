const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse(res: Response) {
    if (res.status === 204) return null;
    const text = await res.text();
    try {
        return JSON.parse(text || 'null');
    } catch {
        return text;
    }
}

export async function fetchFirmServices() {
    const res = await fetch(`${API_BASE}/api/core/firm/services`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load services: ${res.status}`);
    return (await handleResponse(res)) || [];
}

export async function deleteFirmService(id: number) {
    const res = await fetch(`${API_BASE}/api/core/firm/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const body = await handleResponse(res);
        throw new Error(JSON.stringify(body) || `Delete failed: ${res.status}`);
    }
    return handleResponse(res);
}

export async function fetchFirmReferrals() {
    const res = await fetch(`${API_BASE}/api/core/firm/my-referrals`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load referrals: ${res.status}`);
    return (await handleResponse(res)) || [];
}

export async function handleReferralAction(id: number, action: 'accept' | 'reject') {
    const res = await fetch(`${API_BASE}/api/core/company/request/${id}/action`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action }),
    });
    if (!res.ok) {
        const body = await handleResponse(res);
        throw new Error(JSON.stringify(body) || `Action failed: ${res.status}`);
    }
    return handleResponse(res);
}

export async function fetchAllReferrals() {
    const res = await fetch(`${API_BASE}/api/core/admin/referrals`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load admin referrals: ${res.status}`);
    return (await handleResponse(res)) || [];
}

// Firm employee management (mounted under /api/core/firm/management)
export async function fetchFirmEmployees() {
    const res = await fetch(`${API_BASE}/api/core/firm/management/users`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load employees: ${res.status}`);
    return (await handleResponse(res)) || [];
}

export async function createFirmEmployee(payload: any) {
    const res = await fetch(`${API_BASE}/api/core/firm/management/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const body = await handleResponse(res);
        throw new Error(JSON.stringify(body) || `Create failed: ${res.status}`);
    }
    return handleResponse(res);
}

export async function updateFirmEmployeeRole(userId: number, payload: any) {
    const res = await fetch(`${API_BASE}/api/core/firm/management/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const body = await handleResponse(res);
        throw new Error(JSON.stringify(body) || `Update failed: ${res.status}`);
    }
    return handleResponse(res);
}

export async function deleteFirmEmployee(userId: number) {
    const res = await fetch(`${API_BASE}/api/core/firm/management/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const body = await handleResponse(res);
        throw new Error(JSON.stringify(body) || `Delete failed: ${res.status}`);
    }
    return handleResponse(res);
}

export async function registerFirmAndUser(payload: any) {
    const res = await fetch(`${API_BASE}/api/core/firm/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const body = await handleResponse(res);
        throw new Error(JSON.stringify(body) || `Register failed: ${res.status}`);
    }
    return handleResponse(res);
}

export default {
    fetchFirmServices,
    deleteFirmService,
    fetchFirmReferrals,
    handleReferralAction,
    fetchAllReferrals,
    fetchFirmEmployees,
    createFirmEmployee,
    updateFirmEmployeeRole,
    deleteFirmEmployee,
    registerFirmAndUser,
};
