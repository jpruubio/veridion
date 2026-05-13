-- ============================================================
--  Veridion — schema.sql
--  Rode este arquivo UMA VEZ para criar as tabelas no banco.
--  Comando: psql -U postgres -d veridion_db -f src/models/schema.sql
-- ============================================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(100)        NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    senha_hash  TEXT                NOT NULL,
    criado_em   TIMESTAMP DEFAULT NOW()
);

-- Tabela de votos da comunidade
-- UNIQUE (usuario_id, dominio): garante 1 voto por usuário por domínio (anti-spam)
CREATE TABLE IF NOT EXISTS votos (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    dominio     VARCHAR(255)        NOT NULL,
    voto        VARCHAR(20)         NOT NULL CHECK (voto IN ('confiavel', 'suspeito', 'golpe')),
    criado_em   TIMESTAMP DEFAULT NOW(),
    UNIQUE (usuario_id, dominio)
);

-- Tabela de denúncias
CREATE TABLE IF NOT EXISTS denuncias (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    dominio     VARCHAR(255)        NOT NULL,
    motivo      VARCHAR(50)         NOT NULL CHECK (motivo IN ('fake_news', 'golpe', 'site_malicioso', 'conteudo_manipulativo', 'outro')),
    descricao   TEXT,
    criado_em   TIMESTAMP DEFAULT NOW()
);

-- Tabela de histórico de análises
CREATE TABLE IF NOT EXISTS analises (
    id               SERIAL PRIMARY KEY,
    usuario_id       INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    url              TEXT,
    titulo           TEXT,
    score            INTEGER,          -- 0 a 100
    veredicto        VARCHAR(100),
    detalhe          TEXT,             -- JSON com breakdown do Trust Score
    imagem_ia        BOOLEAN,
    imagem_confianca INTEGER,          -- 0 a 100
    analisado_em     TIMESTAMP DEFAULT NOW()
);
