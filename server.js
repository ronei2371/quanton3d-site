import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';

import chatRoutes from './src/routes/chatRoutes.js';
import { apiRoutes } from './src/routes/apiRoutes.js';
import { suggestionsRoutes } from './src/routes/suggestionsRoutes.js';
import { authRoutes } from './src/routes/authRoutes.js';
import { buildAdminRoutes } from './src/routes/adminRoutes.js';
import { metrics } from './src/utils/metrics.js';
import { connectToMongo, isConnected } from './db.js';
import { initializeRAG, checkRAGIntegrity, bootstrapKnowledgeFromFile } from './rag-search.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const MONGODB_URI = process.env.MONGODB_URI || '';

// ====================== CORS ======================
const allowedOrigins = [
  'https://quanton3dia.onrender.com',
  'http://localhost:5173',
  'https://quanton3d-bot-v2.onrender.com',
  'http://localhost:3000',
  'http://localhost:10000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`⚠️ Origem bloqueada: ${origin}`);
      callback(null, true); // compatibilidade
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));           // Aumentado para upload de imagens
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ====================== HEALTH CHECK ======================
app.get('/health', async (req, res) => {
  try {
    const dbStatus = isConnected?.() ? 'connected' : 'disconnected';
    res.json({
      status: 'ok',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      port: PORT
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ====================== MÉTRICAS ======================
app.get('/health/metrics', (req, res) => {
  res.json({
    success: true,
    metrics: metrics.getStats(),
    timestamp: new Date().toISOString()
  });
});

// ====================== ROTAS ======================
app.use('/auth', authRoutes);

const adminRoutes = buildAdminRoutes();
app.use('/admin', adminRoutes);
app.use('/api', adminRoutes);

app.use('/api', apiRoutes);
app.use('/api', suggestionsRoutes);
app.use('/api', chatRoutes);
app.use('/chat', chatRoutes);

// Rewrites para compatibilidade
app.use((req, res, next) => {
  const rewrites = {
    '/api/params/printers': '/api/printers',
    '/params/printers': '/printers',
    '/api/params/profiles': '/api/profiles',
    '/params/profiles': '/profiles',
    '/api/params/stats': '/api/stats',
    '/params/stats': '/stats'
  };
  if (rewrites[req.url]) req.url = rewrites[req.url];
  next();
});

// ====================== FRONTEND ======================
const distPath = path.join(__dirname, 'dist');
const adminPanelPath = path.join(__dirname, 'public', 'params-panel.html');

app.use(express.static(distPath));

app.get(['/admin', '/admin/'], (req, res) => {
  res.sendFile(adminPanelPath, (err) => {
    if (err) res.sendFile(path.join(distPath, 'index.html'));
  });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/admin/') || req.path.startsWith('/auth')) {
    return res.status(404).json({ error: 'Rota não encontrada', path: req.path });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Frontend não encontrado' });
  });
});

// ====================== INICIALIZAÇÃO ======================
const startServer = async () => {
  try {
    console.log('\n🚀 INICIANDO QUANTON3D BOT...\n');

    if (MONGODB_URI) {
      await connectToMongo(MONGODB_URI);
      console.log('[MongoDB] ✅ Conectado');
      await new Promise(resolve => setTimeout(resolve, 1500));
    } else {
      console.warn('[MongoDB] ⚠️ MONGODB_URI não configurada');
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('[INIT] ⚠️ OPENAI_API_KEY não configurada');
    } else {
      console.log('[INIT] ✅ OpenAI API configurada');
    }

    try {
      if (isConnected()) {
        await initializeRAG();
        console.log('[INIT] ✅ RAG inicializado');

        const ragStatus = await checkRAGIntegrity();
        if (!ragStatus?.isValid || ragStatus.totalDocuments === 0) {
          console.log('[INIT] ⚠️ Base de conhecimento vazia. Fazendo bootstrap...');
          const bootstrapResult = await bootstrapKnowledgeFromFile();
          console.log(`[INIT] Bootstrap: ${bootstrapResult.inserted || 0} inseridos`);
        }
      }
    } catch (error) {
      console.error('[INIT] ⚠️ RAG falhou:', error.message);
    }

    console.log('\n✨ Serviços prontos!\n');

    app.listen(PORT, '0.0.0.0', () => {
      console.log('═══════════════════════════════════════════════');
      console.log('🤖 QUANTON3D BOT ONLINE!');
      console.log('═══════════════════════════════════════════════');
      console.log(`📡 Porta: ${PORT}`);
      console.log(`🌍 URL: http://0.0.0.0:${PORT}`);
      console.log('💚 Health: /health');
      console.log('═══════════════════════════════════════════════\n');
    });

  } catch (error) {
    console.error('\n❌ ERRO FATAL AO INICIAR:', error);
    process.exit(1);
  }
};

startServer();