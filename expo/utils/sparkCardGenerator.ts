import { File, Paths } from 'expo-file-system';

export function generateSparkCardHTML(message: string): string {
  const escapedMessage = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Spark'd Card</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      -webkit-tap-highlight-color: transparent;
    }

    .card-container {
      perspective: 1000px;
      width: 100%;
      max-width: 400px;
      aspect-ratio: 3 / 4;
    }

    .card {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
      cursor: pointer;
    }

    .card.flipped {
      transform: rotateY(180deg);
    }

    .card-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .card-front {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      border: 2px solid #333;
    }

    .card-back {
      background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
      border: 2px solid #F97316;
      transform: rotateY(180deg);
      justify-content: center;
    }

    .logo-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo {
      width: 180px;
      height: auto;
      filter: drop-shadow(0 0 30px rgba(249, 115, 22, 0.4));
    }

    .logo-svg {
      width: 100%;
      height: auto;
    }

    .tap-text {
      font-size: 18px;
      font-weight: 600;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 2px;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    .message {
      font-size: 20px;
      line-height: 1.6;
      color: #fff;
      text-align: center;
      max-width: 100%;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .sparkd-badge {
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: rgba(249, 115, 22, 0.2);
      border: 1px solid #F97316;
      border-radius: 20px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      color: #F97316;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    @media (max-width: 480px) {
      .card-face {
        padding: 30px;
      }

      .logo {
        width: 140px;
      }

      .message {
        font-size: 18px;
      }

      .tap-text {
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="card-container">
    <div class="card" id="card">
      <div class="card-face card-front">
        <div class="logo-container">
          <div class="logo">
            <svg class="logo-svg" viewBox="0 0 200 65" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="100" y="45" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#F97316" text-anchor="middle">Spark'd</text>
              <circle cx="180" cy="25" r="8" fill="#F97316" opacity="0.6">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
        </div>
        <div class="tap-text">Tap to Reveal</div>
      </div>

      <div class="card-face card-back">
        <div class="message">${escapedMessage}</div>
        <div class="sparkd-badge">Spark'd</div>
      </div>
    </div>
  </div>

  <script>
    const card = document.getElementById('card');
    let isFlipped = false;

    card.addEventListener('click', function() {
      isFlipped = !isFlipped;
      if (isFlipped) {
        card.classList.add('flipped');
      } else {
        card.classList.remove('flipped');
      }
    });

    card.addEventListener('touchstart', function(e) {
      e.preventDefault();
      isFlipped = !isFlipped;
      if (isFlipped) {
        card.classList.add('flipped');
      } else {
        card.classList.remove('flipped');
      }
    }, { passive: false });
  </script>
</body>
</html>`;
}

export function generateSparkCardDataURL(message: string): string {
  const html = generateSparkCardHTML(message);
  const encoded = encodeURIComponent(html);
  return `data:text/html;charset=utf-8,${encoded}`;
}

export function generateSparkCardShareText(message: string): string {
  const dataURL = generateSparkCardDataURL(message);
  return `💫 Someone sent you a Spark'd card!\n\nOpen this link to reveal your message:\n${dataURL}`;
}

export async function generateSparkCardFile(message: string): Promise<{ uri: string }> {
  const html = generateSparkCardHTML(message);
  const timestamp = Date.now();
  const fileName = `sparkd-card-${timestamp}.html`;
  
  const file = new File(Paths.cache, fileName);
  await file.create({ overwrite: true });
  file.write(html);
  
  return { uri: file.uri };
}

export function getPlainTextShareMessage(): string {
  return '✨ Someone sent you a Spark\'d card! (Attachment required until Spark\'d is live.)';
}
