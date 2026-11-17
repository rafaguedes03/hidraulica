# 💧 HidroCalc PWA - Sistema de Dimensionamento de Bombas Hidráulicas

> **Aplicação Web Progressiva (PWA) Offline-First** para dimensionamento hidráulico de precisão, cálculo de Altura Manométrica Total (HMT), perdas de carga contínuas e localizadas, estimativa de potência de motores e seleção inteligente de bombas comerciais (Schneider, Dancor, Anauger, Thebe, Eletroplas).

---

## 🌟 Funcionalidades Principais

1. **⚡ Offline-First Real (PWA):**
   - Funciona 100% no campo sem sinal de internet graças ao Service Worker e cache local.
   - Pode ser instalado diretamente no celular (Android / iOS) ou computador como um app nativo.

2. **📐 Motor de Engenharia Hidráulica:**
   - **Perda de Carga Contínua:** Fórmula de Hazen-Williams para múltiplos materiais (PVC $C=140$, PEAD $C=140$, Aço Galvanizado $C=125$, Ferro $C=100$).
   - **Perdas Localizadas ($L_{eq}$):** Tabela da NBR 5626 com cálculo automático de curvas 90°/45°, válvulas de pé com crivo, válvulas de retenção e registros.
   - **Verificação de Velocidades:** Semáforo de alerta para velocidades na sucção ($0.7 \sim 1.5\text{ m/s}$) e no recalque ($1.0 \sim 2.2\text{ m/s}$) para evitar cavitação e golpe de aríete.
   - **Cálculo de Potência:** Potência hidráulica ($CV$ e $kW$), potência no eixo com rendimento e sugestão do motor elétrico comercial padronizado.

3. **📊 Curva da Bomba $\times$ Curva da Instalação ($H \times Q$):**
   - Gráfico interativo que cruza a equação da bomba $H(Q) = aQ^2 + bQ + c$ com a curva de perdas do sistema $H_{sis}(Q) = H_{geom} + kQ^{1.852}$, identificando o **Ponto de Operação Real** e o rendimento ($\eta$).

4. **🎯 Dois Modos de Uso:**
   - **Modo Guiado (Produtor Rural):** Assistente com 4 cenários práticos (Abastecimento Doméstico/Sítio, Irrigação Agrícola por gotejamento/aspersão, Bebedouro de Animais/Gado e Sistema Solar Fotovoltaico).
   - **Modo Técnico (Engenheiro/Técnico):** Controle milimétrico de diâmetros, materiais, cotas, perdas singulares e rendimentos de máquina.

5. **📄 Emissão de Laudo Técnico em PDF:**
   - Geração de memorial de cálculo oficial em PDF formatado com dados do produtor, tabela detalhada de perdas, indicação da motobomba e espaço para assinaturas.

6. **🔍 Catálogo Integrado com Busca:**
   - Consulta a modelos comerciais com dados de vazão máxima, altura máxima, potência, tensão, conexões e links para manuais técnicos.

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
- Node.js instalado (v18+)
- (Opcional) MySQL / XAMPP se desejar rodar a API de backend

### 2. Rodar o Frontend (PWA)
```bash
cd frontend
npm run dev
```
O app abrirá em `http://localhost:5173`.

### 3. Rodar o Backend (API REST Node.js + MySQL)
```bash
cd backend
npm run dev
```
A API rodará em `http://localhost:3001`.

*(Nota: O frontend funciona de forma autônoma e completa mesmo sem o backend estar rodando).*

---

## 🗄️ Estrutura de Pastas

```
hidraulica/
├── frontend/
│   ├── src/
│   │   ├── engine/                # Motor de cálculo hidráulico
│   │   │   ├── types.ts           # Definição de tipos TypeScript
│   │   │   ├── hydraulicCalculator.ts # Hazen-Williams, velocidades e HMT
│   │   │   ├── materialsAndFittings.ts # Tubos, rugosidades e Leq NBR 5626
│   │   │   ├── pumpCatalogData.ts # Catálogo de bombas comerciais brasileiras
│   │   │   └── pumpMatcher.ts     # Ranqueamento e ponto de trabalho
│   │   ├── components/            # Componentes de interface
│   │   │   ├── Header.tsx         # Barra superior com status PWA e modos
│   │   │   ├── HydraulicVisualizer.tsx # Diagrama esquemático animado em SVG
│   │   │   ├── QuickWizard.tsx    # Assistente rápido para produtores
│   │   │   ├── TechnicalForm.tsx  # Formulário técnico avançado
│   │   │   ├── FittingSelectorModal.tsx # Seletor visual de conexões
│   │   │   ├── PumpCurveChart.tsx # Gráfico de curva característica H x Q
│   │   │   ├── ResultsPanel.tsx   # Painel de resultados e ranking de bombas
│   │   │   ├── ReportModal.tsx    # Gerador de relatório PDF (jsPDF)
│   │   │   └── CatalogExplorer.tsx # Explorador do catálogo de bombas
│   │   ├── App.tsx                # Aplicação principal reativa
│   │   └── index.css              # Design system Tailwind v4 + Dark Glass
│   ├── vite.config.ts             # Configuração do Vite + PWA Service Worker
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/           # Controllers REST
│   │   ├── database/              # Conexão MySQL, schema.sql e seed.js
│   │   └── server.js              # Servidor Express com fallback offline
│   └── package.json
└── README.md
```

---

## 📚 Referências Técnicas
- **NBR 5626:** Instalação predial de água fria.
- **Porto, R. M.:** *Hidráulica Básica*, EESC-USP.
- **Macintyre, A. J.:** *Bombas e Instalações de Bombeamento*, LTC.
- **Catálogos Oficiais:** Franklin Electric / Schneider, Dancor, Anauger, Thebe.
