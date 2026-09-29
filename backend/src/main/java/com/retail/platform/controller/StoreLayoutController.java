package com.retail.platform.controller;

import com.retail.platform.model.Aisle;
import com.retail.platform.model.Category;
import com.retail.platform.model.Section;
import com.retail.platform.service.StoreLayoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/layout")
@CrossOrigin(origins = "*")
public class StoreLayoutController {

    private final StoreLayoutService storeLayoutService;

    public StoreLayoutController(StoreLayoutService storeLayoutService) {
        this.storeLayoutService = storeLayoutService;
    }

    @GetMapping("/sections")
    public ResponseEntity<List<Section>> getSections() {
        return ResponseEntity.ok(storeLayoutService.getAllSections());
    }

    @PostMapping("/sections")
    public ResponseEntity<Section> createSection(@RequestBody Section section) {
        return ResponseEntity.ok(storeLayoutService.createSection(section));
    }

    @GetMapping("/aisles")
    public ResponseEntity<List<Aisle>> getAisles(@RequestParam(required = false) Long sectionId) {
        if (sectionId != null) {
            return ResponseEntity.ok(storeLayoutService.getAislesBySection(sectionId));
        }
        return ResponseEntity.ok(storeLayoutService.getAllAisles());
    }

    @PostMapping("/aisles")
    public ResponseEntity<Aisle> createAisle(@RequestBody Aisle aisle) {
        return ResponseEntity.ok(storeLayoutService.createAisle(aisle));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(storeLayoutService.getAllCategories());
    }
}
