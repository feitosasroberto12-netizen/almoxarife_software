-- =====================================================================
-- ESQUEMA SQL - SISTEMA DE CONTROLE DE INSUMOS CORPORATIVOS
-- Compatível com Supabase (PostgreSQL)
-- =====================================================================

-- Habilitar a extensão UUID se ainda não estiver ativa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 1. TABELA DE DEPARTAMENTOS
-- =====================================================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    cost_center_code VARCHAR(50) UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================================
-- 2. TABELA DE USUÁRIOS / PERFIS (Vínculo com auth.users do Supabase)
-- =====================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Diretor', 'Controladoria', 'TI', 'Operações', 'Gestor de Departamento')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================================
-- 3. TABELA DE CATEGORIAS DE INSUMOS
-- =====================================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================================
-- 4. TABELA DE INSUMOS (PRODUTOS / ITENS)
-- =====================================================================
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    unit_of_measure VARCHAR(30) NOT NULL DEFAULT 'unidade', -- ex: un, kg, litro, cx
    min_stock_level INTEGER NOT NULL DEFAULT 0,
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    has_expiry BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================================
-- 5. TABELA DE LOTES E ESTOQUE FÍSICO (Para controle de validade)
-- =====================================================================
CREATE TABLE item_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE NOT NULL,
    batch_number VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 0,
    expiry_date DATE,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================================
-- 6. TABELA DE TRANSAÇÕES / MOVIMENTAÇÕES DE ESTOQUE
-- =====================================================================
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES items(id) ON DELETE RESTRICT NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE RESTRICT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('ENTRADA', 'SAIDA_CONSUMO', 'BAIXA_PERDA_VENCIMENTO', 'BAIXA_EXTRAVIO_SUMIÇO', 'AJUSTE_INVENTARIO')),
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC(12, 2) NOT NULL,
    total_cost NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================================
-- 7. TABELA DE AUDITORIAS / CHECK-INS DE INVENTÁRIO
-- =====================================================================
CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE NOT NULL,
    auditor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA')),
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE audit_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES audits(id) ON DELETE CASCADE NOT NULL,
    item_id UUID REFERENCES items(id) ON DELETE RESTRICT NOT NULL,
    expected_quantity INTEGER NOT NULL,
    counted_quantity INTEGER NOT NULL,
    discrepancy_quantity INTEGER GENERATED ALWAYS AS (counted_quantity - expected_quantity) STORED,
    notes TEXT
);

-- =====================================================================
-- ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE
-- =====================================================================
CREATE INDEX idx_item_batches_expiry ON item_batches(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_item_batches_dept ON item_batches(department_id);
CREATE INDEX idx_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_transactions_date ON inventory_transactions(created_at);

-- =====================================================================
-- SEGURANÇA: ROW LEVEL SECURITY (RLS)
-- =====================================================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_items ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Básicas (Exemplo inicial permissivo para autenticados)
CREATE POLICY "Permitir leitura para usuários autenticados em departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir leitura para usuários autenticados em categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir leitura para usuários autenticados em items" ON items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir leitura para usuários autenticados em item_batches" ON item_batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir leitura/escrita para usuários autenticados em inventory_transactions" ON inventory_transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir leitura/escrita para usuários autenticados em audits" ON audits FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir leitura/escrita para usuários autenticados em audit_items" ON audit_items FOR ALL TO authenticated USING (true);
