export interface Session {
    id: string | null;
    username: string | null;
    token: string | null;
    type: string | null;
    expiresAt?: number | null; // Unix timestamp for token expiry
    lastLogin?: number | null; // Unix timestamp of last login
    isAuthenticated: boolean; // Derived property for convenience
}

// Helper function to check if session is valid
export function isSessionValid(session: Session): boolean {
    if (!session.token || !session.expiresAt) {
        return false;
    }
    const now = Math.floor(Date.now() / 1000);
    return session.expiresAt > now;
}

// Helper function to create initial session
export function createInitialSession(): Session {
    return {
        id: null,
        username: null,
        token: null,
        type: null,
        expiresAt: null,
        lastLogin: null,
        isAuthenticated: false
    };
}

// Helper function to create session from API response
export function createSessionFromResponse(data: {
    id: string;
    username: string;
    token: string;
    type: string;
    expiresIn?: number; // seconds until expiry
}): Session {
    const expiresAt = data.expiresIn 
        ? Math.floor(Date.now() / 1000) + data.expiresIn 
        : null;
    
    return {
        id: data.id,
        username: data.username,
        token: data.token,
        type: data.type,
        expiresAt: expiresAt,
        lastLogin: Math.floor(Date.now() / 1000),
        isAuthenticated: true
    };
}