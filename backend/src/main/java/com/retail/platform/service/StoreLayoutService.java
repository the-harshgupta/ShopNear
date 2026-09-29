package com.retail.platform.service;

import com.retail.platform.model.Aisle;
import com.retail.platform.model.Category;
import com.retail.platform.model.Section;
import com.retail.platform.repository.AisleRepository;
import com.retail.platform.repository.CategoryRepository;
import com.retail.platform.repository.SectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StoreLayoutService {

    private final SectionRepository sectionRepository;
    private final AisleRepository aisleRepository;
    private final CategoryRepository categoryRepository;

    public StoreLayoutService(SectionRepository sectionRepository, AisleRepository aisleRepository, CategoryRepository categoryRepository) {
        this.sectionRepository = sectionRepository;
        this.aisleRepository = aisleRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Section> getAllSections() {
        return sectionRepository.findAll();
    }

    public List<Aisle> getAllAisles() {
        return aisleRepository.findAll();
    }

    public List<Aisle> getAislesBySection(Long sectionId) {
        return aisleRepository.findBySectionId(sectionId);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public Section createSection(Section section) {
        return sectionRepository.save(section);
    }

    @Transactional
    public Aisle createAisle(Aisle aisle) {
        return aisleRepository.save(aisle);
    }
}
