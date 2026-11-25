-- Rode este arquivo UMA vez se o banco já existia antes desta versão
-- (criado pelo schema.sql antigo). Em banco novo, use só o schema.sql.
USE hidraulica_db;

ALTER TABLE bombas
  ADD COLUMN codigo VARCHAR(80) NULL AFTER id,
  ADD COLUMN vazao_min_m3h DECIMAL(8,2) NOT NULL DEFAULT 0 AFTER recalque_pol,
  ADD COLUMN pontos_curva JSON NULL,
  ADD COLUMN caracteristicas JSON NULL;

-- As bombas antigas não têm código; o seed recria o catálogo completo.
DELETE FROM bombas;

ALTER TABLE bombas
  MODIFY codigo VARCHAR(80) NOT NULL,
  ADD UNIQUE KEY uq_bombas_codigo (codigo);
