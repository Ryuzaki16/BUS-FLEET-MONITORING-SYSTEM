import { registerPlugin } from "@capacitor/core";

export interface BusPrinterPlugin {
  printTest(): Promise<{ success: boolean; message: string }>;
  printReceipt(options: { text: string }): Promise<{ success: boolean; message: string; text: string }>;
}

export const BusPrinter = registerPlugin<BusPrinterPlugin>("BusPrinter");
