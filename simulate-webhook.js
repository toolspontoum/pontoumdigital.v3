/**
 * SCRIPT DE SIMULAÇÃO DE WEBHOOK - AUTOMARTICLES
 * Este script testa a lógica do seu webhook localmente.
 */
const webhookHandler = require('./api/automarticles/webhook.js');
require('dotenv').config();

const TOKEN = process.env.AUTOMARTICLES_TOKEN || 'ponto1_secure_token_2024';

// Mock do objeto Response do Vercel/Express
const mockRes = {
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        console.log(`\n[STATUS ${this.statusCode}] Resposta:`, JSON.stringify(data, null, 2));
    }
};

async function runTests() {
    console.log("--- INICIANDO TESTES DE WEBHOOK ---\n");

    // 1. Teste CHECK_INTEGRATION
    console.log("1. Testando CHECK_INTEGRATION...");
    await webhookHandler({
        headers: { 'access-token': TOKEN },
        body: { event: 'CHECK_INTEGRATION' }
    }, mockRes);

    // 2. Teste POST_CREATED (Publicado)
    console.log("\n2. Testando POST_CREATED (Simulando novo artigo publicado)...");
    await webhookHandler({
        headers: { 'access-token': TOKEN },
        body: {
            event: 'POST_CREATED',
            post: {
                id: "sim-123",
                slug: "artigo-simulado-pelo-teste",
                status: "publish",
                title: "Artigo de Teste Via Simulação",
                description: "Se este post aparecer no site, a conexão simulada funcionou perfeitamente.",
                content: {
                    html: "<h2>Sucesso!</h2><p>Este conteúdo foi inserido via script de teste.</p>"
                },
                featured_image: {
                    url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
                    alt_text: "Código no monitor"
                },
                category: { id: "cat-1", name: "Tecnologia" },
                publication_date: Math.floor(Date.now() / 1000)
            }
        }
    }, mockRes);

    console.log("\n--- TESTES FINALIZADOS ---");
    console.log("Verifique se o arquivo 'public/content/blog/posts/artigo-simulado-pelo-teste.json' foi criado.");
}

runTests();
