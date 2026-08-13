# LuxInfra — Additional Feature Roadmap

Status legend: [x] implemented · [ ] pending

## Frontend/UI Features
- [ ] 1. Dark Mode Toggle
- [ ] 2. Mobile-First PWA with offline capability
- [ ] 3. Real-time Notifications (WebSocket)
- [ ] 4. Custom Dashboard Widgets
- [ ] 5. Voice-to-Text Expenses
- [ ] 6. Photo Annotation with markup layers
- [ ] 7. Interactive 3D Room Viewer
- [x] 8. QR Code Scanner for inventory

## Backend/API Features
- [x] 9. Export Templates (GST audit, contractor billing, client reports)
- [~] 10. Scheduled Reports with cron jobs (ScheduleEmail wired; cron trigger pending)
- [ ] 11. Multi-company Support (tenant isolation)
- [ ] 12. Audit Trail for all CRUD operations
- [x] 13. Advanced Search API with full-text search
- [ ] 14. File Storage Service (S3/Cloudflare R2)
- [ ] 15. GraphQL Endpoint

## AI/ML Features
- [x] 16. AI Photo Analysis for progress tracking
- [x] 17. Predictive Budgeting with AiCostPrediction
- [ ] 18. Smart Document OCR (bills, contracts, invoices)
- [ ] 19. Anomaly Detection for expenses
- [x] 20. Automated Invoice Generation via GstEInvoiceService

## Integration Features
- [ ] 21. GST E-Invoice API integration (invoice builder exists; live API not connected)
- [x] 22. Payment Gateway (Razorpay/PayU)
- [x] 23. Email Templates
- [ ] 24. WhatsApp Business API notifications
- [ ] 25. Calendar Sync (Google Calendar/Outlook)

## Project Management Enhancements
- [x] 26. Gantt Chart Timeline - Interactive Gantt view using ProjectTimelineStage
- [x] 27. Resource Allocation - Assign workers/materials with capacity planning
- [x] 28. Time Tracking - Track time via TimeEntry model
- [x] 29. Change Order Workflow - change request → approval → billing
- [~] 30. Subcontractor Portal - work-order management exists; self-service login pending
- [x] 31. Quality Control Checkpoints - inspections with photo evidence
- [x] 32. Equipment Maintenance - schedule servicing based on EquipmentLog

## Interior Design Specific
- [x] 33. AR Room Measurement
- [x] 34. Material Catalog Integration
- [x] 35. Finish Library
- [x] 36. Cost Estimation Tool from BOQ items
