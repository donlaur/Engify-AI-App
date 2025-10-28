# Security Policy

**Last Updated**: October 28, 2025  
**Status**: SOC 2 Ready (not yet audited)

## Overview

Engify.ai maintains enterprise-grade security practices without the enterprise price tag.

## Security Controls

### Data Classification
- PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED
- Automatic classification based on data type
- Encryption required for CONFIDENTIAL+

### Encryption
- **At Rest**: AES-256-GCM
- **In Transit**: TLS 1.3
- **Keys**: Secure environment variables

### Access Control
- RBAC with 4 roles
- MFA required
- Session management

### Monitoring
- Comprehensive audit logging
- Automated security scanning
- Real-time alerts

## Compliance Alignment

**SOC 2 Ready**: Architecture aligns with Trust Services Criteria  
**GDPR**: Right to access, deletion, export  
**CCPA**: California privacy rights supported

**Note**: "Ready" means audit-ready architecture, not certified.

## Contact

**Security**: security@engify.ai
