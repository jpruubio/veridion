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

-- Tabela de histórico de análises
CREATE TABLE IF NOT EXISTS analises (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    url             TEXT,
    titulo          TEXT,
    score           INTEGER,         -- 0 a 100
    veredicto       VARCHAR(100),
    detalhe         TEXT,
    imagem_ia       BOOLEAN,
    imagem_confianca INTEGER,        -- 0 a 100
    analisado_em    TIMESTAMP DEFAULT NOW()
);