import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runVerification() {
  console.log('Iniciando verificação E2E com Playwright...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const appPath = `file://${path.resolve(__dirname, '../index.html')}`;
  console.log('Navegando para:', appPath);
  await page.goto(appPath, { waitUntil: 'networkidle' });

  // 1. Dashboard Check
  await page.waitForSelector('#app-view-container');
  console.log('✓ Dashboard Executivo carregado');
  await page.screenshot({ path: 'screenshot_dashboard.png', fullPage: true });

  // 2. Insumos View Check
  await page.click('a[data-route="insumos"]');
  await page.waitForSelector('#insumos-table-body');
  console.log('✓ Gestão de Insumos & Lotes carregado');
  await page.screenshot({ path: 'screenshot_insumos.png', fullPage: true });

  // 3. Movimentações View Check
  await page.click('a[data-route="movimentacoes"]');
  await page.waitForSelector('#form-movement');
  console.log('✓ Movimentações de Estoque carregado');

  // Submit a test movement (Entrada)
  await page.fill('#mov-quantity', '10');
  await page.fill('#mov-reason', 'Recebimento de lote adicional para teste E2E.');
  await page.click('#btn-submit-mov');
  console.log('✓ Teste de movimentação enviado');

  await page.screenshot({ path: 'screenshot_movimentacoes.png', fullPage: true });

  // 4. Auditoria View Check
  await page.click('a[data-route="auditoria"]');
  await page.waitForSelector('#btn-open-modal-audit');
  console.log('✓ Auditoria & Relatórios carregado');
  await page.screenshot({ path: 'screenshot_auditoria.png', fullPage: true });

  await browser.close();
  console.log('Verificação E2E concluída com sucesso!');
}

runVerification().catch(err => {
  console.error('Erro na verificação:', err);
  process.exit(1);
});
