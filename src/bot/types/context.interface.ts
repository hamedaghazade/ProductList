import { Context, Scenes } from 'telegraf';

export interface ProductWizardSession extends Scenes.WizardSessionData {
  productData: {
    name?: string;
    quantityPerPackage?: number;
    price?: number;
    barcode?: string;
    barcodeType?: 'EAN13' | 'CODE128';
  };
}

export interface BotContext extends Context {
  session: Scenes.WizardSession<ProductWizardSession>;
  scene: Scenes.SceneContextScene<BotContext, ProductWizardSession>;
  wizard: Scenes.WizardContextWizard<BotContext>;
}