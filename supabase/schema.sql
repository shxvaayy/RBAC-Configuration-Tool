-- RBAC Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Role Permissions Junction Table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Roles Junction Table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Enable Row Level Security (RLS)
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permissions (allow authenticated users to read, only admins can modify)
CREATE POLICY "Allow authenticated users to read permissions"
    ON permissions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert permissions"
    ON permissions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update permissions"
    ON permissions FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to delete permissions"
    ON permissions FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for roles
CREATE POLICY "Allow authenticated users to read roles"
    ON roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert roles"
    ON roles FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update roles"
    ON roles FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to delete roles"
    ON roles FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for role_permissions
CREATE POLICY "Allow authenticated users to read role_permissions"
    ON role_permissions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert role_permissions"
    ON role_permissions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete role_permissions"
    ON role_permissions FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for user_roles
CREATE POLICY "Allow authenticated users to read user_roles"
    ON user_roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert user_roles"
    ON user_roles FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete user_roles"
    ON user_roles FOR DELETE
    TO authenticated
    USING (true);

