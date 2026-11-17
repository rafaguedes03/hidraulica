-- ==========================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS: HIDRÁULICA (IFNMG)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS hidraulica_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hidraulica_db;

-- 1. Tabela de Fabricantes
CREATE TABLE IF NOT EXISTS fabricantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  site VARCHAR(255),
  origem VARCHAR(50) DEFAULT 'Brasil',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabela de Bombas Hidráulicas
CREATE TABLE IF NOT EXISTS bombas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fabricante_id INT NOT NULL,
  modelo VARCHAR(120) NOT NULL,
  tipo ENUM('centrifuga', 'submersivel', 'periferica', 'autoaspirante', 'injetora', 'solar') NOT NULL,
  potencia_cv DECIMAL(5,2) NOT NULL,
  potencia_kw DECIMAL(5,2) NOT NULL,
  voltagem VARCHAR(100) NOT NULL,
  fase VARCHAR(80) DEFAULT 'Monofásico 127/220V',
  succao_pol VARCHAR(30) NOT NULL,
  recalque_pol VARCHAR(30) NOT NULL,
  vazao_max_m3h DECIMAL(8,2) NOT NULL,
  altura_max_mca DECIMAL(8,2) NOT NULL,
  coef_a DECIMAL(12,6) NOT NULL, -- Coeficiente a da curva H = a*Q^2 + b*Q + c
  coef_b DECIMAL(12,6) NOT NULL, -- Coeficiente b da curva
  coef_c DECIMAL(12,6) NOT NULL, -- Coeficiente c da curva (H estático a Q=0)
  vazao_bep_m3h DECIMAL(8,2),    -- Vazão no Ponto de Melhor Eficiência
  altura_bep_mca DECIMAL(8,2),   -- Altura no Ponto de Melhor Eficiência
  rendimento_max_pct INT DEFAULT 60,
  preco_estimado_brl DECIMAL(10,2),
  link_manual VARCHAR(255),
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fabricante_id) REFERENCES fabricantes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Tabela de Dimensionamentos Salvos / Projetos
CREATE TABLE IF NOT EXISTS dimensionamentos_salvos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projeto_nome VARCHAR(150) NOT NULL,
  cliente_nome VARCHAR(150),
  localizacao VARCHAR(150),
  vazao_m3h DECIMAL(8,2) NOT NULL,
  hmt_mca DECIMAL(8,2) NOT NULL,
  potencia_cv DECIMAL(5,2) NOT NULL,
  bomba_selecionada_id INT,
  dados_completos_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bomba_selecionada_id) REFERENCES bombas(id) ON DELETE SET NULL
) ENGINE=InnoDB;
