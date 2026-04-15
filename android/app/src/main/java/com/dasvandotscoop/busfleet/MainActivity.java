package com.dasvandotscoop.busfleet;

import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.dasvandotscoop.busfleet.plugins.printer.BusPrinterPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        Log.d("BusPrinter", "Registering BusPrinterPlugin");
        registerPlugin(BusPrinterPlugin.class);
        super.onCreate(savedInstanceState);
    }
}