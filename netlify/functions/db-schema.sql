-- Schema para tabela de parceiros
-- Este arquivo é apenas para documentação, o código real será criado via Astra DB

CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    website_url TEXT,
    course_url TEXT,
    instructor_1_name VARCHAR(255),
    instructor_1_description TEXT,
    instructor_1_phone VARCHAR(50),
    instructor_2_name VARCHAR(255),
    instructor_2_description TEXT,
    instructor_2_phone VARCHAR(50),
    highlights TEXT, -- JSON array de destaques do curso
    images TEXT, -- JSON array de URLs das imagens
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_partners_active ON partners(is_active);
CREATE INDEX idx_partners_order ON partners(display_order);
