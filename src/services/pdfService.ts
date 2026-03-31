import { NextResponse } from "next/server";
import { BookingPDFData } from "@/components/pdf/types/booking.types";
import { generateQRCodeDataURL } from "@/utils/qrGenerator";

export interface PDFStorageResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  url?: string;
  error?: string;
}

export interface PDFGenerationResult {
  success: boolean;
  pdfBuffer?: Buffer;
  fileName?: string;
  error?: string;
}

export class PDFService {
  private static readonly PDF_STORAGE_DIR =
    process.env.PDF_STORAGE_DIR || "./public/tickets";
  private static readonly PDF_BASE_URL = process.env.PDF_BASE_URL || "/tickets";

  /**
   * Generate professional booking PDF using React + react-pdf
   * Uses BookingTicketPDFNew component
   * @param data - Booking data
   * @param logoUrl - Optional logo URL (unused, kept for compatibility)
   * @param providerPDFBase64 - Optional base64 encoded provider PDF (unused, kept for compatibility)
   */
  static async generateBookingPDF(
    data: BookingPDFData,
    logoUrl?: string,
    providerPDFBase64?: string
  ): Promise<PDFGenerationResult> {
    try {
      console.log("📄 Generating PDF for booking:", data.bookingId);
      console.log("🔗 Using new PDF design matching client reference");

      // Generate QR code with PNR
      const pnr = data.confirmationNumber || data.bookingId || "UNKNOWN";
      const qrCodeUrl = await generateQRCodeDataURL(pnr);
      console.log("✅ QR Code generated for PNR:", pnr);

      // Import react-pdf rendering utilities dynamically
      const ReactPDF = await import("@react-pdf/renderer");
      const { default: BookingTicketPDFNew } = await import(
        "@/components/pdf/BookingTicketPDFNew"
      );
      const React = await import("react");

      // Create React element with QR code
      const pdfDocument = React.createElement(BookingTicketPDFNew, {
        data,
        qrCodeUrl,
      });

      // Render PDF to buffer
      const pdfBuffer = await ReactPDF.renderToBuffer(pdfDocument as any);

      const fileName = `AndamanExcursion_${data.confirmationNumber
        }_${Date.now()}.pdf`;

      console.log("✅ PDF generated successfully:", fileName);

      return {
        success: true,
        pdfBuffer: Buffer.from(pdfBuffer),
        fileName,
      };
    } catch (error) {
      console.error("❌ PDF generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Store PDF buffer to file system and return public URL
   */
  static async storePDFToFileSystem(
    pdfBuffer: Buffer,
    bookingId: string,
    operator: string = "booking"
  ): Promise<PDFStorageResult> {
    try {
      const fs = await import("fs");
      const path = await import("path");

      console.log(`📁 PDF Storage Dir: ${this.PDF_STORAGE_DIR}`);
      console.log(`📁 PDF Base URL: ${this.PDF_BASE_URL}`);

      // Ensure directory exists
      await this.ensureStorageDirectory();

      const timestamp = Date.now();
      const fileName = `${operator}_${bookingId}_${timestamp}.pdf`;
      const filePath = path.join(this.PDF_STORAGE_DIR, fileName);

      console.log(`📝 Writing PDF to: ${filePath}`);
      console.log(`📝 File name: ${fileName}`);
      console.log(`📝 Buffer size: ${pdfBuffer.length} bytes`);

      // Write PDF to file
      await fs.promises.writeFile(filePath, pdfBuffer);

      const publicUrl = `${this.PDF_BASE_URL}/${fileName}`;
      console.log(`✅ PDF stored successfully: ${publicUrl}`);

      return {
        success: true,
        filePath,
        fileName,
        url: publicUrl,
      };
    } catch (error) {
      console.error("❌ PDF storage error:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown",
        code: (error as any)?.code,
        errno: (error as any)?.errno,
        syscall: (error as any)?.syscall,
        path: (error as any)?.path,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Store PDF from base64 string to file system
   * Used for storing provider PDFs (Makruzz, Sealink, etc.)
   */
  static async storePDFFromBase64(
    base64Data: string,
    bookingId: string,
    operator: string = "booking"
  ): Promise<PDFStorageResult> {
    try {
      console.log(`📄 PDFService: Processing base64 PDF for ${operator}/${bookingId}`);

      // Validate input
      if (!base64Data) {
        console.error("❌ Empty base64 data provided");
        return {
          success: false,
          error: "Empty base64 data",
        };
      }

      if (typeof base64Data !== "string") {
        console.error("❌ base64Data is not a string:", typeof base64Data);
        return {
          success: false,
          error: `Invalid base64 data type: ${typeof base64Data}`,
        };
      }

      console.log(`📄 Base64 data length: ${base64Data.length} characters`);

      // Convert base64 to buffer
      const pdfBuffer = Buffer.from(base64Data, "base64");
      console.log(`📄 Converted to buffer: ${pdfBuffer.length} bytes`);

      if (pdfBuffer.length === 0) {
        console.error("❌ Resulting buffer is empty");
        return {
          success: false,
          error: "Empty PDF buffer after base64 conversion",
        };
      }

      // Store using existing method
      const result = await this.storePDFToFileSystem(pdfBuffer, bookingId, operator);

      if (result.success) {
        console.log(`✅ PDF stored successfully: ${result.url}`);
      } else {
        console.error(`❌ PDF storage failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error("❌ Base64 PDF storage error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Ensure storage directory exists
   */
  private static async ensureStorageDirectory(): Promise<void> {
    try {
      const fs = await import("fs");
      await fs.promises.access(this.PDF_STORAGE_DIR);
    } catch {
      const fs = await import("fs");
      await fs.promises.mkdir(this.PDF_STORAGE_DIR, { recursive: true });
      console.log(`📁 Created PDF storage directory: ${this.PDF_STORAGE_DIR}`);
    }
  }

  /**
   * Generate PDF and return as HTTP response (for immediate download)
   */
  static createPDFResponse(pdfBuffer: Buffer, fileName: string) {
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  }
}

export default PDFService;
