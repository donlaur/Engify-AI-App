export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
}

export interface ClassificationPolicy {
  classification: DataClassification;
  encryptionRequired: boolean;
  retentionDays: number;
  accessRoles: string[];
}

const CLASSIFICATION_POLICIES: Record<DataClassification, ClassificationPolicy> = {
  [DataClassification.PUBLIC]: {
    classification: DataClassification.PUBLIC,
    encryptionRequired: false,
    retentionDays: 365 * 7, // 7 years
    accessRoles: ['*'],
  },
  [DataClassification.INTERNAL]: {
    classification: DataClassification.INTERNAL,
    encryptionRequired: true,
    retentionDays: 365 * 3, // 3 years
    accessRoles: ['admin', 'manager', 'user'],
  },
  [DataClassification.CONFIDENTIAL]: {
    classification: DataClassification.CONFIDENTIAL,
    encryptionRequired: true,
    retentionDays: 365 * 2, // 2 years
    accessRoles: ['admin', 'manager'],
  },
  [DataClassification.RESTRICTED]: {
    classification: DataClassification.RESTRICTED,
    encryptionRequired: true,
    retentionDays: 365, // 1 year
    accessRoles: ['admin'],
  },
};

export function getClassificationPolicy(classification: DataClassification): ClassificationPolicy {
  return CLASSIFICATION_POLICIES[classification];
}

export function classifyData(dataType: string): DataClassification {
  const classifications: Record<string, DataClassification> = {
    'user.email': DataClassification.CONFIDENTIAL,
    'user.password': DataClassification.RESTRICTED,
    'user.apiKey': DataClassification.RESTRICTED,
    'user.mfaSecret': DataClassification.RESTRICTED,
    'prompt.content': DataClassification.INTERNAL,
    'analytics.usage': DataClassification.INTERNAL,
    'billing.invoice': DataClassification.CONFIDENTIAL,
    'public.content': DataClassification.PUBLIC,
  };
  
  return classifications[dataType] || DataClassification.INTERNAL;
}
