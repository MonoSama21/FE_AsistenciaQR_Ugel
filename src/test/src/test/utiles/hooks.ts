import { Browser, BrowserContext, chromium } from "@playwright/test";
import { Before, After, BeforeAll, AfterAll, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { pageFixture } from "./pageFixture";

let browser: Browser;
let context: BrowserContext;

setDefaultTimeout(90 * 1000); // 90 segundos para manejar aplicación lenta y múltiples tests

BeforeAll(async function () {
  // Limpiar la carpeta de videos antes de iniciar las pruebas
  const fs = require('fs');
  const path = require('path');
  const videosDir = path.join(process.cwd(), 'target', 'videos');
  
  try {
    if (fs.existsSync(videosDir)) {
      const files = fs.readdirSync(videosDir);
      for (const file of files) {
        fs.unlinkSync(path.join(videosDir, file));
      }
      console.log('🧹 Carpeta de videos limpiada antes de iniciar las pruebas');
    }
  } catch (error) {
    console.log('⚠️ No se pudo limpiar la carpeta de videos:', error.message);
  }

  browser = await chromium.launch({
    headless: true, // IMPORTANTE para GitHub Actions
  });
});

Before(async function () {
  // Configurar el contexto con grabación de video
  context = await browser.newContext({
    recordVideo: {
      dir: 'target/videos/', // Los videos se guardarán temporalmente aquí
      size: { width: 1500, height: 800 }
    }
  });
  const page = await context.newPage();
  pageFixture.page = page;

  // Sobrescribir console.log para adjuntar logs al reporte
  const originalLog = console.log;
  const self = this;
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    originalLog(message);
    try {
      self.attach(message, 'text/plain');
    } catch (error) {
      // Ignorar si no se puede adjuntar
    }
  };

  await page.setViewportSize({
    width: 1500,
    height: 700,
  });
});

// CIERRA TODO EL ESCENARIO (PÁGINA + CONTEXT) Y TOMA SCREENSHOT/VIDEO SI FALLA
After(async function (scenario) {
  // Obtener la ruta del video ANTES de cerrar la página
  let videoPath: string | null = null;
  if (pageFixture.page) {
    videoPath = await pageFixture.page.video()?.path() || null;
  }

  // Si el escenario falla, tomar captura de pantalla y adjuntarla al reporte
  if (scenario.result?.status === Status.FAILED && pageFixture.page) {
    try {
      // Captura de pantalla
      const screenshot = await pageFixture.page.screenshot({
        fullPage: true,
        type: 'png'
      });
      this.attach(screenshot, 'image/png');
      console.log(`📸 Captura tomada para el escenario fallido: ${scenario.pickle.name}`);
    } catch (error) {
      console.log(`⚠️ No se pudo tomar captura: ${error.message}`);
    }
  }

  // Cerrar la página
  if (pageFixture.page) {
    await pageFixture.page.close();
  }

  // Cerrar el contexto (esto finaliza la grabación del video)
  if (context) {
    await context.close();
  }

  // Si el escenario falló y hay video, adjuntarlo al reporte
  if (scenario.result?.status === Status.FAILED && videoPath) {
    try {
      const fs = require('fs');
      const path = require('path');
      
      if (fs.existsSync(videoPath)) {
        // Leer el video y convertirlo a base64
        const videoBuffer = fs.readFileSync(videoPath);
        const videoBase64 = videoBuffer.toString('base64');
        
        // Crear un HTML embebido con el video
        const videoHtml = `
          <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #dc3545;">
            <h4 style="margin: 0 0 10px 0; color: #dc3545; font-size: 16px;">🎥 Video de la Ejecución del Escenario Fallido</h4>
            <video controls style="width: 80%; max-width: 100%; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <source src="data:video/webm;base64,${videoBase64}" type="video/webm">
              Tu navegador no soporta la reproducción de videos.
            </video>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d;">
              📹 Duración completa del escenario • Resolución: 1500x800 • Formato: WebM
            </p>
          </div>
        `;
        
        // Adjuntar el HTML al reporte (Cucumber permite attachments de tipo text/html)
        this.attach(videoHtml, 'text/html');
        console.log(`🎥 Video embebido en el reporte HTML para: ${scenario.pickle.name}`);
      }
    } catch (error) {
      console.log(`⚠️ No se pudo adjuntar el video: ${error}`);
    }
  }
});

// CIERRA EL BROWSER AL FINAL
AfterAll(async function () {
  if (browser) {
    await browser.close();
  }
});
