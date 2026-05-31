package com.ecommerce.backend.service;

import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.User;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceService.class);
    private static final double VAT_RATE = 0.05;
    private static final String INVOICE_STORAGE_PATH = "uploads/invoices/";

    private static final Font TITLE_FONT = new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, new BaseColor(44, 62, 80));
    private static final Font HEADER_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);
    private static final Font NORMAL_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, new BaseColor(80, 80, 80));
    private static final Font BOLD_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, new BaseColor(44, 62, 80));
    private static final Font TOTAL_FONT = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, new BaseColor(0, 102, 204));

    public byte[] generateInvoicePDF(Order order, User user) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();

            // HEADER
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{1, 2});

            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setHorizontalAlignment(Element.ALIGN_LEFT);
            Paragraph logoText = new Paragraph("e-TECH Zone", new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, new BaseColor(139, 92, 246)));
            logoCell.addElement(logoText);
            headerTable.addCell(logoCell);

            PdfPCell companyCell = new PdfPCell();
            companyCell.setBorder(Rectangle.NO_BORDER);
            companyCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            companyCell.addElement(new Paragraph("Premium Tech Retail", NORMAL_FONT));
            companyCell.addElement(new Paragraph("lorenzorafanomezantsoa@gmail.com", NORMAL_FONT));
            companyCell.addElement(new Paragraph("+261 38 94 088 53", NORMAL_FONT));
            headerTable.addCell(companyCell);

            document.add(headerTable);
            document.add(Chunk.NEWLINE);

            // TITLE
            Paragraph title = new Paragraph("INVOICE", TITLE_FONT);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // INFO
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{1, 1});

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            PdfPCell leftInfo = new PdfPCell();
            leftInfo.setBorder(Rectangle.NO_BORDER);
            leftInfo.addElement(new Paragraph("Invoice #: " + generateInvoiceNumber(order), BOLD_FONT));
            leftInfo.addElement(new Paragraph("Order ID: #" + order.getId(), NORMAL_FONT));
            infoTable.addCell(leftInfo);

            PdfPCell rightInfo = new PdfPCell();
            rightInfo.setBorder(Rectangle.NO_BORDER);
            rightInfo.setHorizontalAlignment(Element.ALIGN_RIGHT);
            rightInfo.addElement(new Paragraph("Date: " + order.getCreatedAt().format(dateFormatter), NORMAL_FONT));
            rightInfo.addElement(new Paragraph("Time: " + order.getCreatedAt().format(timeFormatter), NORMAL_FONT));
            infoTable.addCell(rightInfo);

            document.add(infoTable);
            document.add(Chunk.NEWLINE);

            // ADDRESSES
            PdfPTable addressTable = new PdfPTable(2);
            addressTable.setWidthPercentage(100);
            addressTable.setWidths(new float[]{1, 1});

            PdfPCell billingCell = new PdfPCell();
            billingCell.setBorder(Rectangle.BOX);
            billingCell.setBorderColor(BaseColor.LIGHT_GRAY);
            billingCell.setPadding(8);
            billingCell.addElement(new Paragraph("BILL TO", BOLD_FONT));
            billingCell.addElement(new Paragraph(user.getFirstName() + " " + user.getLastName(), NORMAL_FONT));
            billingCell.addElement(new Paragraph(user.getEmail(), NORMAL_FONT));
            addressTable.addCell(billingCell);

            PdfPCell shippingCell = new PdfPCell();
            shippingCell.setBorder(Rectangle.BOX);
            shippingCell.setBorderColor(BaseColor.LIGHT_GRAY);
            shippingCell.setPadding(8);
            shippingCell.addElement(new Paragraph("SHIP TO", BOLD_FONT));
            shippingCell.addElement(new Paragraph(user.getFirstName() + " " + user.getLastName(), NORMAL_FONT));
            shippingCell.addElement(new Paragraph(user.getEmail(), NORMAL_FONT));
            addressTable.addCell(shippingCell);

            document.add(addressTable);
            document.add(Chunk.NEWLINE);

            // ORDER DETAILS
            PdfPTable orderDetailTable = new PdfPTable(2);
            orderDetailTable.setWidthPercentage(100);
            orderDetailTable.setWidths(new float[]{1, 2});

            orderDetailTable.addCell(createLabelCell("Payment Method:", BOLD_FONT));
            orderDetailTable.addCell(createValueCell("Credit Card", NORMAL_FONT));
            orderDetailTable.addCell(createLabelCell("Order Status:", BOLD_FONT));
            orderDetailTable.addCell(createValueCell(order.getStatus().toString(), NORMAL_FONT));

            document.add(orderDetailTable);
            document.add(Chunk.NEWLINE);

            // ITEMS TABLE
            PdfPTable itemTable = new PdfPTable(5);
            itemTable.setWidthPercentage(100);
            itemTable.setWidths(new float[]{3, 1, 1, 1, 1});
            itemTable.setSpacingBefore(10f);
            itemTable.setSpacingAfter(10f);

            String[] headers = {"Product", "Quantity", "Unit Price", "VAT (5%)", "Total"};
            for (String header : headers) {
                PdfPCell headerCell = new PdfPCell(new Phrase(header, HEADER_FONT));
                headerCell.setBackgroundColor(new BaseColor(44, 62, 80));
                headerCell.setPadding(8);
                headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                itemTable.addCell(headerCell);
            }

            double subTotal = 0.0;
            for (Order.OrderItem item : order.getItems()) {
                double itemPrice = item.getProductPrice();
                int qty = item.getQuantity();
                double itemTotal = itemPrice * qty;
                double itemVAT = itemTotal * VAT_RATE;
                double itemGrandTotal = itemTotal + itemVAT;
                subTotal += itemTotal;

                itemTable.addCell(createCell(item.getProductName(), NORMAL_FONT, Element.ALIGN_LEFT));
                itemTable.addCell(createCell(String.valueOf(qty), NORMAL_FONT, Element.ALIGN_CENTER));
                itemTable.addCell(createCell(formatPrice(itemPrice), NORMAL_FONT, Element.ALIGN_RIGHT));
                itemTable.addCell(createCell(formatPrice(itemVAT), NORMAL_FONT, Element.ALIGN_RIGHT));
                itemTable.addCell(createCell(formatPrice(itemGrandTotal), NORMAL_FONT, Element.ALIGN_RIGHT));
            }
            document.add(itemTable);

            // TOTALS
            double shipping = 0.0;
            double vat = subTotal * VAT_RATE;
            double grandTotal = subTotal + shipping + vat;

            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(40);
            totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalTable.setWidths(new float[]{1, 1});

            totalTable.addCell(createLabelCell("Subtotal:", BOLD_FONT));
            totalTable.addCell(createValueCell(formatPrice(subTotal), NORMAL_FONT));
            totalTable.addCell(createLabelCell("Shipping:", BOLD_FONT));
            totalTable.addCell(createValueCell("Free", NORMAL_FONT));
            totalTable.addCell(createLabelCell("VAT (5%):", BOLD_FONT));
            totalTable.addCell(createValueCell(formatPrice(vat), NORMAL_FONT));
            totalTable.addCell(createLabelCell("GRAND TOTAL:", TOTAL_FONT));
            totalTable.addCell(createValueCell(formatPrice(grandTotal), TOTAL_FONT));

            document.add(totalTable);
            document.add(Chunk.NEWLINE);

            // FOOTER
            Paragraph footer = new Paragraph();
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.add(new Chunk("Thank you for shopping with e-TECH Zone!\n", BOLD_FONT));
            footer.add(new Chunk("For any questions, please contact our support team at support@etechzone.com", NORMAL_FONT));
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("PDF generation error for order ID: {}", order.getId(), e);
            return null;
        }
    }

    public String saveInvoiceToDisk(Order order, User user) {
        try {
            byte[] pdfBytes = generateInvoicePDF(order, user);
            if (pdfBytes == null) return null;

            Path directory = Paths.get(INVOICE_STORAGE_PATH);
            if (!Files.exists(directory)) {
                Files.createDirectories(directory);
            }

            String fileName = "INVOICE_" + order.getId() + "_" +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            Path filePath = directory.resolve(fileName);

            try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
                fos.write(pdfBytes);
            }

            log.info("Invoice saved to disk: {}", filePath.toAbsolutePath());
            return filePath.toString();

        } catch (Exception e) {
            log.error("Failed to save invoice to disk for order: {}", order.getId(), e);
            return null;
        }
    }

    public byte[] getInvoiceFromDisk(Long orderId) {
        try {
            Path directory = Paths.get(INVOICE_STORAGE_PATH);
            if (!Files.exists(directory)) return null;

            return Files.list(directory)
                    .filter(path -> path.getFileName().toString().contains("INVOICE_" + orderId))
                    .findFirst()
                    .map(path -> {
                        try {
                            return Files.readAllBytes(path);
                        } catch (Exception e) {
                            log.error("Failed to read invoice file", e);
                            return null;
                        }
                    })
                    .orElse(null);

        } catch (Exception e) {
            log.error("Failed to get invoice from disk for order: {}", orderId, e);
            return null;
        }
    }

    public String getInvoicePath(Long orderId) {
        try {
            Path directory = Paths.get(INVOICE_STORAGE_PATH);
            if (!Files.exists(directory)) return null;

            return Files.list(directory)
                    .filter(path -> path.getFileName().toString().contains("INVOICE_" + orderId))
                    .findFirst()
                    .map(Path::toString)
                    .orElse(null);

        } catch (Exception e) {
            log.error("Failed to get invoice path for order: {}", orderId, e);
            return null;
        }
    }

    private String generateInvoiceNumber(Order order) {
        return "INV-" + order.getCreatedAt().getYear() + "-" + String.format("%06d", order.getId());
    }

    private String formatPrice(double price) {
        return String.format("%.2f €", price);
    }

    private PdfPCell createCell(String content, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(content, font));
        cell.setPadding(6);
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }

    private PdfPCell createLabelCell(String label, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(label, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setPadding(4);
        return cell;
    }

    private PdfPCell createValueCell(String value, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(value, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setPadding(4);
        return cell;
    }
}