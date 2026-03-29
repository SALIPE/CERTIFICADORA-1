CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'perfil_usuario') THEN
    CREATE TYPE perfil_usuario AS ENUM ('ADMIN', 'VOLUNTARIO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_oficina') THEN
    CREATE TYPE status_oficina AS ENUM ('ATIVA', 'INATIVA', 'CONCLUIDA');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil perfil_usuario NOT NULL DEFAULT 'VOLUNTARIO',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oficina (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(150) NOT NULL,
  tema VARCHAR(150) NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status status_oficina NOT NULL DEFAULT 'ATIVA',
  carga_horaria_prevista INTEGER NOT NULL DEFAULT 0 CHECK (carga_horaria_prevista >= 0),
  criado_por UUID REFERENCES usuario(id),
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT oficina_datas_validas CHECK (data_fim >= data_inicio)
);

CREATE TABLE IF NOT EXISTS usuario_oficina (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuario(id),
  oficina_id UUID NOT NULL REFERENCES oficina(id),
  total_presencas INTEGER NOT NULL DEFAULT 0 CHECK (total_presencas >= 0),
  total_faltas INTEGER NOT NULL DEFAULT 0 CHECK (total_faltas >= 0),
  percentual_frequencia NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (percentual_frequencia >= 0 AND percentual_frequencia <= 100),
  horas_cumpridas NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (horas_cumpridas >= 0),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT usuario_oficina_unique UNIQUE (usuario_id, oficina_id)
);

DROP TRIGGER IF EXISTS trg_usuario_updated_at ON usuario;
CREATE TRIGGER trg_usuario_updated_at
BEFORE UPDATE ON usuario
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_oficina_updated_at ON oficina;
CREATE TRIGGER trg_oficina_updated_at
BEFORE UPDATE ON oficina
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_usuario_oficina_updated_at ON usuario_oficina;
CREATE TRIGGER trg_usuario_oficina_updated_at
BEFORE UPDATE ON usuario_oficina
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_usuario_oficina_usuario_id ON usuario_oficina(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_oficina_oficina_id ON usuario_oficina(oficina_id);

-- Exemplo de inserção de admin
-- 1) Gere o hash localmente com: node scripts/generate-hash.js Admin@123
-- 2) Substitua o valor abaixo pelo hash gerado
-- INSERT INTO usuario (nome, email, senha_hash, perfil)
-- VALUES ('Administrador TEDI', 'admin@tedi.com', '<HASH_BCRYPT_AQUI>', 'ADMIN');
