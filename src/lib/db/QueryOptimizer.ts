export class QueryOptimizer {
  static buildProjection(fields: string[]) {
    return fields.reduce((acc, field) => ({ ...acc, [field]: 1 }), {});
  }
  
  static buildSort(field: string, order: 'asc' | 'desc' = 'desc') {
    return { [field]: order === 'asc' ? 1 : -1 };
  }
  
  static buildPagination(page: number = 1, limit: number = 20) {
    return {
      skip: (page - 1) * limit,
      limit,
    };
  }
}
