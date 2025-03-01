package com.example.demo;

import java.io.IOException;
import java.io.InputStream;

import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.pdf.PDFParser;
import org.apache.tika.parser.txt.TXTParser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;

@SpringBootApplication
@RestController
@RequestMapping("/api/resumes")
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @PostMapping("/upload")
    public String uploadResume(@RequestParam("file") MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            String extractedText = extractTextFromFile(inputStream, file.getContentType());
            return "Resume uploaded successfully! Extracted text: " + extractedText.substring(0, Math.min(500, extractedText.length()));
        } catch (IOException | TikaException | SAXException e) {
            return "Failed to upload resume: " + e.getMessage();
        }
    }

    private String extractTextFromFile(InputStream inputStream, String contentType) throws IOException, TikaException, SAXException {
        BodyContentHandler handler = new BodyContentHandler(-1);
        Metadata metadata = new Metadata();
        ParseContext parseContext = new ParseContext();

        if (contentType.equals("application/pdf")) {
            PDFParser pdfParser = new PDFParser();
            pdfParser.parse(inputStream, handler, metadata, parseContext);
        } else {
            TXTParser txtParser = new TXTParser();
            txtParser.parse(inputStream, handler, metadata, parseContext);
        }

        return handler.toString();
    }
}
