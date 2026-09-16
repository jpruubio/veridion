-- ============================================================
--  Veridion — schema.sql
--  Rode este arquivo UMA VEZ para criar as tabelas no banco.
--  Comando: psql "<DATABASE_URL>" -f src/models/schema.sql
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

-- Tabela de tokens para redefinição de senha
-- token é UUID gerado no servidor, expira em 1 hora
CREATE TABLE IF NOT EXISTS reset_tokens (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
    token       VARCHAR(64) UNIQUE NOT NULL,
    expira_em   TIMESTAMP NOT NULL,
    usado       BOOLEAN DEFAULT FALSE,
    criado_em   TIMESTAMP DEFAULT NOW()
);

-- Tabela de denúncias de imagens (botão direito → "Analisar imagem com IA")
CREATE TABLE IF NOT EXISTS denuncias_imagens (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    url_imagem  TEXT                NOT NULL,
    motivo      VARCHAR(50)         NOT NULL CHECK (motivo IN ('imagem_fake', 'conteudo_inadequado', 'direitos_autorais', 'outro')),
    criado_em   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  Reconciliação de colunas — ADD COLUMN IF NOT EXISTS é idempotente:
--  seguro para rodar de novo tanto num banco novo quanto num banco já
--  em produção que tenha ficado desalinhado deste arquivo.
-- ============================================================

-- usuarios: nome de exibição editável (distinto do "nome" de cadastro) e avatar de perfil
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nome_completo VARCHAR(150);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar_url    TEXT;

-- votos: comentário opcional deixado junto com o voto
ALTER TABLE votos ADD COLUMN IF NOT EXISTS comentario TEXT;

-- denuncias: avaliação em estrelas, comentário, nome do autor (snapshot) e resposta da empresa
-- "descricao" fica mantida por compatibilidade, mas não é usada por nenhum código atual.
ALTER TABLE denuncias ADD COLUMN IF NOT EXISTS estrelas         SMALLINT CHECK (estrelas BETWEEN 1 AND 5);
ALTER TABLE denuncias ADD COLUMN IF NOT EXISTS comentario       TEXT;
ALTER TABLE denuncias ADD COLUMN IF NOT EXISTS nome_usuario     VARCHAR(100);
ALTER TABLE denuncias ADD COLUMN IF NOT EXISTS respondido       BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE denuncias ADD COLUMN IF NOT EXISTS resposta_empresa TEXT;
