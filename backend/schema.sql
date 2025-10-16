-- Cria o banco de dados se ele não existir
CREATE DATABASE IF NOT EXISTS wayne_industries;

-- Seleciona o banco de dados para usar
USE wayne_industries;

-- Tabela de Papeis (Permissões)
CREATE TABLE IF NOT EXISTS papeis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_papel VARCHAR(50) NOT NULL UNIQUE
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    id_papel INT,
    FOREIGN KEY (id_papel) REFERENCES papeis(id)
);

-- Tabela de Recursos
CREATE TABLE IF NOT EXISTS recursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    descricao TEXT,
    status VARCHAR(50),
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserção de dados iniciais (SEEDS) --

-- Insere os papéis de usuário
INSERT INTO papeis (id, nome_papel) VALUES (1, 'Funcionário'), (2, 'Gerente'), (3, 'Administrador de Segurança')
ON DUPLICATE KEY UPDATE nome_papel=VALUES(nome_papel);

-- Insere usuários de exemplo
-- A senha para todos é 'batman' (o hash pode precisar ser gerado novamente como fizemos)
INSERT INTO usuarios (id, nome, email, senha_hash, id_papel) VALUES
(1, 'Bruce Wayne', 'bruce@wayne-enterprises.com', '$2b$12$EixZa4e85d8senha_hashg2d21UuSynuPg7a0sL7GkAPrSFLh92.a02qgI/3ZfG', 3),
(2, 'Lucius Fox', 'lucius@wayne-enterprises.com', '$2b$12$EixZa4e85d8g2d21UuSynuPg7a0sL7GkAPrSFLh92.a02qgI/3ZfG', 2),
(3, 'John Doe', 'john.d@wayne-enterprises.com', '$2b$12$EixZa4e85d8g2d21UuSynuPg7a0sL7GkAPrSFLh92.a02qgI/3ZfG', 1)
ON DUPLICATE KEY UPDATE nome=VALUES(nome);

-- Insere recursos de exemplo
INSERT INTO recursos (nome, tipo, descricao, status) VALUES
('Bat-móvel Tumbler', 'Veículo', 'Veículo de assalto urbano blindado.', 'Operacional'),
('Bat-pod', 'Veículo', 'Motocicleta de escape, ejetada do Tumbler.', 'Em Manutenção'),
('Lançador de Gancho Grapnel', 'Equipamento', 'Dispositivo para escalada rápida em prédios.', 'Operacional')
ON DUPLICATE KEY UPDATE nome=VALUES(nome);