package com.dasvandotscoop.busfleet.plugins.printer;

import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BusPrinter")
public class BusPrinterPlugin extends Plugin {

    @PluginMethod
    public void printTest(PluginCall call) {
        try {
            Log.d("PrinterPlugin", "printTest reached native Android plugin");

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Printer plugin reached Android successfully");

            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Print failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void printReceipt(PluginCall call) {
        try {
            String text = call.getString("text", "");

            Log.d("PrinterPlugin", "printReceipt called with text: " + text);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "printReceipt reached Android");
            ret.put("text", text);

            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Receipt print failed: " + e.getMessage());
        }
    }
}