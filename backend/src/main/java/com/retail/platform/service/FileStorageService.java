package com.retail.platform.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.*;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final String UPLOAD_DIR = "uploads/products";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "webp");
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    private final Path rootLocation;

    public FileStorageService() {
        this.rootLocation = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory for product images: " + UPLOAD_DIR, e);
        }
    }

    /**
     * Validates and stores a product image file.
     *
     * @param file The uploaded multipart file
     * @return The public relative URL path, e.g. "/uploads/products/uuid.jpg"
     */
    public String storeProductImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 5 MB limit. Please choose a smaller image.");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : ""
        );

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Invalid file format. Allowed formats: JPG, JPEG, PNG, WEBP.");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Please upload a valid image file.");
        }

        try {
            // Generate safe unique filename
            String uniqueFileName = UUID.randomUUID().toString() + "." + extension;
            Path destinationFile = this.rootLocation.resolve(uniqueFileName).normalize().toAbsolutePath();

            if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
                throw new SecurityException("Cannot store file outside current directory.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            // Return relative URL that can be served statically
            return "/uploads/products/" + uniqueFileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store product image.", e);
        }
    }

    /**
     * Deletes an uploaded product image file if it exists in the storage directory.
     *
     * @param imageUrl The image URL, e.g. "/uploads/products/uuid.jpg"
     */
    public void deleteProductImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("/uploads/products/")) {
            return;
        }

        try {
            String fileName = imageUrl.substring("/uploads/products/".length());
            Path filePath = this.rootLocation.resolve(fileName).normalize().toAbsolutePath();
            if (filePath.getParent().equals(this.rootLocation.toAbsolutePath())) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException ignored) {
            // Log and ignore deletion failures
        }
    }

    /**
     * Downloads an image from the real internet and stores it locally under /uploads/products/.
     * If downloading fails or the image exceeds the 5MB limit, safely returns the original URL.
     */
     public String downloadAndStoreImage(String imageUrl) {
         if (imageUrl == null || imageUrl.trim().isEmpty() || imageUrl.startsWith("/uploads/")) {
             return imageUrl;
         }
         try {
             HttpClient client = HttpClient.newBuilder()
                     .connectTimeout(Duration.ofSeconds(3))
                     .build();
             HttpRequest req = HttpRequest.newBuilder()
                     .uri(URI.create(imageUrl.trim()))
                     .timeout(Duration.ofSeconds(4))
                     .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                     .GET()
                     .build();
             HttpResponse<byte[]> resp = client.send(req, HttpResponse.BodyHandlers.ofByteArray());
             if (resp.statusCode() == 200 && resp.body() != null && resp.body().length > 0 && resp.body().length <= MAX_FILE_SIZE) {
                 String ext = "jpg";
                 String contentType = resp.headers().firstValue("content-type").orElse("").toLowerCase();
                 if (contentType.contains("png")) ext = "png";
                 else if (contentType.contains("webp")) ext = "webp";

                 String filename = UUID.randomUUID().toString() + "." + ext;
                 Path target = this.rootLocation.resolve(filename);
                 Files.write(target, resp.body(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                 return "/uploads/products/" + filename;
             }
         } catch (Exception ignored) {
             // Fall back gracefully to the original URL if external host prevents direct download
         }
         return imageUrl;
     }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}
