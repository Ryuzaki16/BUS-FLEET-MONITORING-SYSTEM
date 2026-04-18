package com.dasvandotscoop.busfleet.plugins.printer;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.common.BitMatrix;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@CapacitorPlugin(name = "BusPrinter")
public class BusPrinterPlugin extends Plugin {

    private static final String TAG = "PrinterPlugin";
    private static final String PRINTER_PACKAGE = "com.bld.settings.print";

    private static final int QR_SIZE = 380;
    private static final int FINAL_FEED_LINES = 4;
    private static final int QR_TEST_FINAL_FEED_LINES = 2;

    @PluginMethod
    public void testQrCapability(PluginCall call) {
        String qrText = clean(call.getString("qrText"));

        if (qrText.isEmpty()) {
            call.reject("QR text is required");
            return;
        }

        try {
            JSObject result = dryRunQrCapability(qrText);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "testQrCapability failed", e);
            call.reject("Failed to test QR capability: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void testQrPrint(PluginCall call) {
        String qrText = clean(call.getString("qrText"));

        if (qrText.isEmpty()) {
            call.reject("QR text is required");
            return;
        }

        try {
            boolean success = tryDirectQrTestPrint(qrText);

            JSObject result = new JSObject();
            result.put("success", success);
            result.put("method", success ? "direct_qr_test" : "none");
            result.put("message", success ? "QR test sent to printer" : "QR test printing failed");
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "testQrPrint failed", e);
            call.reject("Failed to test QR printing: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void printReceipt(PluginCall call) {
        String text = clean(call.getString("text"));
        String qrText = clean(call.getString("qrText"));
        boolean enableQr = call.getBoolean("enableQr", false);

        if (text.isEmpty()) {
            call.reject("Receipt text is required");
            return;
        }

        try {
            String effectiveQrText = enableQr ? qrText : "";
            boolean directPrinted = tryDirectPrint(text, effectiveQrText);

            if (directPrinted) {
                JSObject result = new JSObject();
                result.put("success", true);
                result.put("method", "direct");
                result.put("message", "Receipt printed directly");
                result.put("qrEnabled", !effectiveQrText.isEmpty());
                call.resolve(result);
                return;
            }

            Log.d(TAG, "Direct print unavailable, falling back to printer service app");
            boolean intentSent = tryIntentPrint(text);

            if (intentSent) {
                JSObject result = new JSObject();
                result.put("success", true);
                result.put("method", "intent");
                result.put("message", "Print intent sent");
                result.put("qrEnabled", false);
                call.resolve(result);
                return;
            }

            call.reject("Both direct print and printer service fallback failed");
        } catch (Exception e) {
            Log.e(TAG, "printReceipt failed", e);
            call.reject("Failed to print receipt: " + e.getMessage(), e);
        }
    }

    private JSObject dryRunQrCapability(String qrText) {
        JSObject result = new JSObject();
        List<String> logs = new ArrayList<>();

        boolean printManagerClassFound = false;
        boolean opened = false;
        boolean bitmapGenerated = false;
        boolean imageMethodFound = false;
        boolean imageMethodWorked = false;
        String imageMethodUsed = null;

        logs.add("Starting dry-run QR capability check");

        try {
            Class<?> printManagerClass = Class.forName("android.bld.PrintManager");
            printManagerClassFound = true;
            logs.add("Found android.bld.PrintManager");

            Object printManager = resolvePrintManager(printManagerClass);
            if (printManager == null) {
                logs.add("PrintManager instance is null");
                return buildCapabilityResult(
                        false,
                        printManagerClassFound,
                        false,
                        false,
                        false,
                        false,
                        null,
                        logs);
            }

            invokeNoArg(printManagerClass, printManager, "open");
            opened = true;
            logs.add("Opened PrintManager successfully");

            trySetBlackLabel(printManagerClass, printManager, false);
            logs.add("Called setBlackLabel(false) if available");

            Bitmap qrBitmap = generateQrBitmap(qrText, QR_SIZE, QR_SIZE);
            bitmapGenerated = true;
            logs.add("Generated QR bitmap successfully");

            String[] attempts = new String[] {
                    "addImage(Bitmap)",
                    "addBitmap(Bitmap)",
                    "addImage(int, Bitmap)",
                    "addBitmap(int, Bitmap)"
            };

            for (String attempt : attempts) {
                try {
                    switch (attempt) {
                        case "addImage(Bitmap)": {
                            Method method = printManagerClass.getMethod("addImage", Bitmap.class);
                            imageMethodFound = true;
                            logs.add("Found method: " + attempt);
                            method.invoke(printManager, qrBitmap);
                            imageMethodWorked = true;
                            imageMethodUsed = attempt;
                            logs.add("Dry-run method invoke succeeded: " + attempt);
                            break;
                        }
                        case "addBitmap(Bitmap)": {
                            Method method = printManagerClass.getMethod("addBitmap", Bitmap.class);
                            imageMethodFound = true;
                            logs.add("Found method: " + attempt);
                            method.invoke(printManager, qrBitmap);
                            imageMethodWorked = true;
                            imageMethodUsed = attempt;
                            logs.add("Dry-run method invoke succeeded: " + attempt);
                            break;
                        }
                        case "addImage(int, Bitmap)": {
                            Method method = printManagerClass.getMethod("addImage", int.class, Bitmap.class);
                            imageMethodFound = true;
                            logs.add("Found method: " + attempt);
                            method.invoke(printManager, 1, qrBitmap);
                            imageMethodWorked = true;
                            imageMethodUsed = attempt;
                            logs.add("Dry-run method invoke succeeded: " + attempt);
                            break;
                        }
                        case "addBitmap(int, Bitmap)": {
                            Method method = printManagerClass.getMethod("addBitmap", int.class, Bitmap.class);
                            imageMethodFound = true;
                            logs.add("Found method: " + attempt);
                            method.invoke(printManager, 1, qrBitmap);
                            imageMethodWorked = true;
                            imageMethodUsed = attempt;
                            logs.add("Dry-run method invoke succeeded: " + attempt);
                            break;
                        }
                    }
                } catch (NoSuchMethodException e) {
                    logs.add("Method not found: " + attempt);
                } catch (Throwable t) {
                    logs.add("Method found but invoke failed: " + attempt + " -> "
                            + t.getClass().getSimpleName() + ": " + t.getMessage());
                }

                if (imageMethodWorked) {
                    break;
                }
            }

            logs.add("Dry-run completed without calling start() (no paper used)");

            return buildCapabilityResult(
                    imageMethodWorked,
                    printManagerClassFound,
                    opened,
                    bitmapGenerated,
                    imageMethodFound,
                    imageMethodWorked,
                    imageMethodUsed,
                    logs);

        } catch (ClassNotFoundException e) {
            logs.add("PrintManager class not found: " + e.getMessage());
        } catch (Throwable t) {
            logs.add("Dry-run failed: " + t.getClass().getSimpleName() + ": " + t.getMessage());
        }

        return buildCapabilityResult(
                false,
                printManagerClassFound,
                opened,
                bitmapGenerated,
                imageMethodFound,
                imageMethodWorked,
                imageMethodUsed,
                logs);
    }

    private JSObject buildCapabilityResult(
            boolean success,
            boolean printManagerClassFound,
            boolean opened,
            boolean bitmapGenerated,
            boolean imageMethodFound,
            boolean imageMethodWorked,
            String imageMethodUsed,
            List<String> logs) {
        JSObject result = new JSObject();
        result.put("success", success);
        result.put("printManagerClassFound", printManagerClassFound);
        result.put("opened", opened);
        result.put("bitmapGenerated", bitmapGenerated);
        result.put("imageMethodFound", imageMethodFound);
        result.put("imageMethodWorked", imageMethodWorked);
        result.put("imageMethodUsed", imageMethodUsed == null ? JSObject.NULL : imageMethodUsed);
        result.put("logs", logs.toString());
        return result;
    }

    private boolean tryDirectQrTestPrint(String qrText) {
        try {
            Class<?> printManagerClass = Class.forName("android.bld.PrintManager");
            Object printManager = resolvePrintManager(printManagerClass);

            if (printManager == null) {
                return false;
            }

            invokeNoArg(printManagerClass, printManager, "open");
            trySetBlackLabel(printManagerClass, printManager, false);

            Method addTextMethod = resolveAddTextMethod(printManagerClass);

            addTextMethod.invoke(printManager, 1, 3, true, false, "QR TEST");
            tryAddLineFeed(printManagerClass, printManager, 1);

            Bitmap qrBitmap = generateQrBitmap(qrText, QR_SIZE, QR_SIZE);
            boolean qrImagePrinted = tryPrintBitmap(printManagerClass, printManager, qrBitmap);

            if (!qrImagePrinted) {
                Log.w(TAG, "QR test image printing not supported");
                return false;
            }

            tryAddLineFeed(printManagerClass, printManager, 1);
            addTextMethod.invoke(printManager, 1, 3, false, false, "Scan Me!");
            tryAddLineFeed(printManagerClass, printManager, QR_TEST_FINAL_FEED_LINES);

            invokeNoArg(printManagerClass, printManager, "start");

            Log.d(TAG, "QR test print succeeded");
            return true;
        } catch (Throwable t) {
            Log.w(TAG, "QR test print failed", t);
            return false;
        }
    }

    private boolean tryDirectPrint(String text, String qrText) {
        try {
            Log.d(TAG, "Trying direct print via android.bld.PrintManager");

            Class<?> printManagerClass = Class.forName("android.bld.PrintManager");
            Object printManager = resolvePrintManager(printManagerClass);

            if (printManager == null) {
                Log.w(TAG, "PrintManager instance is null");
                return false;
            }

            invokeNoArg(printManagerClass, printManager, "open");
            trySetBlackLabel(printManagerClass, printManager, false);

            Method addTextMethod = resolveAddTextMethod(printManagerClass);
            addTextMethod.invoke(printManager, 1, 3, false, false, text);

            if (!qrText.isEmpty()) {
                Log.d(TAG, "QR requested, generating bitmap");
                tryAddLineFeed(printManagerClass, printManager, 1);

                Bitmap qrBitmap = generateQrBitmap(qrText, QR_SIZE, QR_SIZE);
                boolean qrImagePrinted = tryPrintBitmap(printManagerClass, printManager, qrBitmap);

                if (qrImagePrinted) {
                    Log.d(TAG, "QR bitmap added successfully");

                    tryAddLineFeed(printManagerClass, printManager, 1);
                    addTextMethod.invoke(printManager, 1, 3, false, false, "Scan Me!");
                    tryAddLineFeed(printManagerClass, printManager, 1);
                } else {
                    Log.w(TAG, "QR bitmap printing not supported, skipping QR on receipt");
                }
            } else {
                Log.d(TAG, "QR not requested / missing qrText");
            }

            tryAddLineFeed(printManagerClass, printManager, FINAL_FEED_LINES);
            invokeNoArg(printManagerClass, printManager, "start");

            Log.d(TAG, "Direct print succeeded");
            return true;
        } catch (ClassNotFoundException e) {
            Log.w(TAG, "android.bld.PrintManager not found", e);
            return false;
        } catch (NoSuchMethodException e) {
            Log.w(TAG, "Expected PrintManager method not found", e);
            return false;
        } catch (Throwable t) {
            Log.w(TAG, "Direct print failed", t);
            return false;
        }
    }

    private Object resolvePrintManager(Class<?> printManagerClass) throws Exception {
        Method getDefaultInstanceMethod = printManagerClass.getMethod("getDefaultInstance", Context.class);
        return getDefaultInstanceMethod.invoke(null, getContext());
    }

    private Method resolveAddTextMethod(Class<?> printManagerClass) throws Exception {
        return printManagerClass.getMethod(
                "addText",
                int.class,
                int.class,
                boolean.class,
                boolean.class,
                String.class);
    }

    private void invokeNoArg(Class<?> clazz, Object target, String methodName) throws Exception {
        Method method = clazz.getMethod(methodName);
        method.invoke(target);
    }

    private boolean tryPrintBitmap(Class<?> printManagerClass, Object printManager, Bitmap bitmap) {
        if (bitmap == null) {
            return false;
        }

        try {
            Method method = printManagerClass.getMethod("addImage", Bitmap.class);
            method.invoke(printManager, bitmap);
            Log.d(TAG, "Used addImage(Bitmap)");
            return true;
        } catch (Throwable ignored) {
            Log.d(TAG, "addImage(Bitmap) unavailable");
        }

        try {
            Method method = printManagerClass.getMethod("addBitmap", Bitmap.class);
            method.invoke(printManager, bitmap);
            Log.d(TAG, "Used addBitmap(Bitmap)");
            return true;
        } catch (Throwable ignored) {
            Log.d(TAG, "addBitmap(Bitmap) unavailable");
        }

        try {
            Method method = printManagerClass.getMethod("addImage", int.class, Bitmap.class);
            method.invoke(printManager, 1, bitmap);
            Log.d(TAG, "Used addImage(int, Bitmap) with mode 1");
            return true;
        } catch (Throwable ignored) {
            Log.d(TAG, "addImage(int, Bitmap) unavailable");
        }

        try {
            Method method = printManagerClass.getMethod("addBitmap", int.class, Bitmap.class);
            method.invoke(printManager, 1, bitmap);
            Log.d(TAG, "Used addBitmap(int, Bitmap) with mode 1");
            return true;
        } catch (Throwable ignored) {
            Log.d(TAG, "addBitmap(int, Bitmap) unavailable");
        }

        return false;
    }

    private Bitmap generateQrBitmap(String content, int width, int height) throws Exception {
        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.MARGIN, 1);

        BitMatrix matrix = new MultiFormatWriter().encode(
                content,
                BarcodeFormat.QR_CODE,
                width,
                height,
                hints);

        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);

        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                bitmap.setPixel(x, y, matrix.get(x, y) ? Color.BLACK : Color.WHITE);
            }
        }

        return bitmap;
    }

    private void trySetBlackLabel(Class<?> printManagerClass, Object printManager, boolean enabled) {
        try {
            Method setBlackLabelMethod = printManagerClass.getMethod("setBlackLabel", boolean.class);
            setBlackLabelMethod.invoke(printManager, enabled);
        } catch (Throwable ignored) {
            Log.d(TAG, "setBlackLabel method not available");
        }
    }

    private void tryAddLineFeed(Class<?> printManagerClass, Object printManager, int lines) {
        if (lines <= 0) {
            return;
        }

        try {
            Method addLineFeedMethod = printManagerClass.getMethod("addLineFeed", int.class);
            addLineFeedMethod.invoke(printManager, lines);
        } catch (Throwable ignored) {
            Log.d(TAG, "addLineFeed method not available");
        }
    }

    private boolean tryIntentPrint(String text) {
        try {
            PackageManager pm = getContext().getPackageManager();

            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setPackage(PRINTER_PACKAGE);
            intent.putExtra(Intent.EXTRA_TEXT, text);
            intent.setType("text/plain");
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            if (intent.resolveActivity(pm) == null) {
                Log.w(TAG, "Printer app not found: " + PRINTER_PACKAGE);
                return false;
            }

            if (getActivity() != null) {
                getActivity().startActivity(intent);
            } else {
                getContext().startActivity(intent);
            }

            Log.d(TAG, "Printer service intent sent");
            return true;
        } catch (Throwable t) {
            Log.w(TAG, "Intent print fallback failed", t);
            return false;
        }
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}