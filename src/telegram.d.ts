// telegram.d.ts
interface TelegramWebApp {
    initData: string;
    initDataUnsafe: object;
    version: string;
    platform: string;
    colorScheme: string;
    themeParams: object;
    viewportHeight: number;
    expand(): void;
    close(): void;
    onEvent(eventType: string, callback: () => void): void;
    offEvent(eventType: string, callback: () => void): void;
    sendData(data: string): void;
  }
  
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
  