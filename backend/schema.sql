CREATE DATABASE IF NOT EXISTS wayne_industries;

USE wayne_industries;

CREATE TABLE IF NOT EXISTS papeis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_papel VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    id_papel INT,
    FOREIGN KEY (id_papel) REFERENCES papeis(id)
);

CREATE TABLE IF NOT EXISTS recursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    descricao TEXT,
    status VARCHAR(50),
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO papeis (id, nome_papel) VALUES (1, 'Funcionário'), (2, 'Gerente'), (3, 'Administrador de Segurança')
ON DUPLICATE KEY UPDATE nome_papel=VALUES(nome_papel);

INSERT INTO usuarios (id, nome, email, senha_hash, id_papel) VALUES
(1, 'Bruce Wayne', 'bruce@wayne-enterprises.com', '$2b$12$ihkfATwWpCIC8L7mugAXkeVPabbjfgFQt76tWVvVzikV8xAP.MfC6', 3),
(2, 'Lucius Fox', 'lucius@wayne-enterprises.com', '$2b$12$ihkfATwWpCIC8L7mugAXkeVPabbjfgFQt76tWVvVzikV8xAP.MfC6', 2),
(3, 'John Doe', 'john.d@wayne-enterprises.com', '$2b$12$ihkfATwWpCIC8L7mugAXkeVPabbjfgFQt76tWVvVzikV8xAP.MfC6', 1)
ON DUPLICATE KEY UPDATE nome=VALUES(nome);

-- Insere alguns recursos iniciais para popular o BD
INSERT INTO recursos (nome, tipo, descricao, status) VALUES
('Bat-móvel Tumbler', 'Veículo', 'Veículo de assalto urbano blindado.', 'Operacional'),
('Bat-pod', 'Veículo', 'Motocicleta de escape, ejetada do Tumbler.', 'Em Manutenção'),
('Lançador de Gancho Grapnel', 'Equipamento', 'Dispositivo para escalada rápida em prédios.', 'Operacional')
ON DUPLICATE KEY UPDATE nome=VALUES(nome);
