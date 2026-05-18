CREATE TABLE IF NOT EXISTS dashboard_widget (
    id_widget VARCHAR(100) PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- Ex: 'Resumo', 'BarCategoria', 'LineSaldo'
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    w INTEGER NOT NULL,
    h INTEGER NOT NULL,
    configuracao JSON, -- Reservado para opções de customização futuras (cores extras, labels, etc.)
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dashboard_widget_usuario ON dashboard_widget(id_usuario);
