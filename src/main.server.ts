import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

console.log('🏁 main.ts 啟動中'); // ← 加入這行

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
