package com.retail.platform.controller;

import com.retail.platform.model.OperationalIssue;
import com.retail.platform.repository.OperationalIssueRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*")
public class OperationalIssueController {

    private final OperationalIssueRepository issueRepository;

    public OperationalIssueController(OperationalIssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    @GetMapping
    public ResponseEntity<List<OperationalIssue>> getAllIssues() {
        return ResponseEntity.ok(issueRepository.findByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<OperationalIssue> createIssue(@RequestBody OperationalIssue issue) {
        if (issue.getReportedAt() == null) {
            issue.setReportedAt("Today, " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a")));
        }
        if (issue.getStatus() == null) {
            issue.setStatus("OPEN");
        }
        return ResponseEntity.ok(issueRepository.save(issue));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<?> resolveIssue(@PathVariable Long id) {
        return issueRepository.findById(id).map(issue -> {
            issue.setStatus("RESOLVED");
            return ResponseEntity.ok(issueRepository.save(issue));
        }).orElse(ResponseEntity.notFound().build());
    }
}
