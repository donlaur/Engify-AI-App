/**
 * AI Tool Cost Comparison Component
 * 
 * Displays cost comparison across usage tiers (light, mid, power)
 * Shows subscription costs, token costs, and total costs
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  calculateAllTiers,
  formatCost,
  type CostCalculationResult,
  type ToolPricing,
  type TokenPricing,
} from '@/lib/utils/ai-tool-cost-calculator';
import type { AITool } from '@/lib/db/schemas/ai-tool';
import { Icons } from '@/lib/icons';

interface AIToolCostComparisonProps {
  toolPricing: AITool['pricing'];
  toolName: string;
}

export function AIToolCostComparison({
  toolPricing,
  toolName,
}: AIToolCostComparisonProps) {
  const tokenPricing: TokenPricing | undefined = toolPricing.tokenPricing
    ? {
        inputCostPer1M: toolPricing.tokenPricing.inputCostPer1M,
        outputCostPer1M: toolPricing.tokenPricing.outputCostPer1M,
        model: toolPricing.tokenPricing.model,
      }
    : undefined;

  const pricing: ToolPricing = {
    free: toolPricing.free,
    paid: toolPricing.paid,
  };

  const calculations = calculateAllTiers(pricing, tokenPricing);

  // If all tiers are free, show a simple message
  if (calculations.every((calc) => calc.totalCost === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cost Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Icons.check className="mx-auto h-8 w-8 text-green-500 mb-2" />
            <p className="text-lg font-semibold">Completely Free</p>
            <p className="text-sm text-muted-foreground">
              {toolName} is free to use with no usage limits
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Comparison by Usage Level</CardTitle>
        <p className="text-sm text-muted-foreground">
          Estimated monthly costs based on typical usage patterns
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Usage Level</th>
                  <th className="text-right p-3 font-semibold">Monthly Requests</th>
                  <th className="text-right p-3 font-semibold">Base Cost</th>
                  {tokenPricing && (
                    <th className="text-right p-3 font-semibold">Token Cost</th>
                  )}
                  <th className="text-right p-3 font-semibold">Total Cost</th>
                  <th className="text-right p-3 font-semibold">Cost/Request</th>
                </tr>
              </thead>
              <tbody>
                {calculations.map((calc) => (
                  <CostRow key={calc.tier} calculation={calc} showTokenColumn={!!tokenPricing} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {calculations.map((calc) => (
              <CostCard key={calc.tier} calculation={calc} />
            ))}
          </div>

          {/* Notes */}
          <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Note:</strong> Costs are estimates based on average token usage per request.
              Actual costs may vary.
            </p>
            {toolPricing.paid?.creditsPerMonth && (
              <p>
                Includes {toolPricing.paid.creditsPerMonth.toLocaleString()}{' '}
                {toolPricing.paid.creditsUnit || 'credits'}/month. Overage costs apply for usage
                beyond included credits.
              </p>
            )}
            {tokenPricing && (
              <p>
                Token pricing: ${tokenPricing.inputCostPer1M?.toFixed(2)}/1M input,{' '}
                ${tokenPricing.outputCostPer1M?.toFixed(2)}/1M output
                {tokenPricing.model && ` (${tokenPricing.model})`}
              </p>
            )}
            {toolPricing.alternativePricing && (
              <p>
                {toolPricing.alternativePricing.unitName || 'Unit'} pricing:{' '}
                ${toolPricing.alternativePricing.costPerUnit?.toFixed(2)} per{' '}
                {toolPricing.alternativePricing.unitName || 'unit'}
                {toolPricing.alternativePricing.baseMinimum && 
                  ` (minimum: $${toolPricing.alternativePricing.baseMinimum})`}
                {toolPricing.alternativePricing.includedUnits && 
                  ` (${toolPricing.alternativePricing.includedUnits} included in base plan)`}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CostRow({
  calculation,
  showTokenColumn,
}: {
  calculation: CostCalculationResult;
  showTokenColumn: boolean;
}) {
  const { tierDefinition, baseCost, tokenCost, totalCost, costPerRequest } = calculation;

  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-3">
        <div className="font-medium">{tierDefinition.name}</div>
        <div className="text-xs text-muted-foreground">{tierDefinition.description}</div>
      </td>
      <td className="p-3 text-right">
        {tierDefinition.monthlyRequests.toLocaleString()}
      </td>
      <td className="p-3 text-right">{formatCost(baseCost)}</td>
      {showTokenColumn && (
        <td className="p-3 text-right">
          {tokenCost > 0 ? formatCost(tokenCost) : 'Included'}
        </td>
      )}
      <td className="p-3 text-right">
        <span className="font-semibold">{formatCost(totalCost)}</span>
      </td>
      <td className="p-3 text-right text-sm text-muted-foreground">
        {formatCost(costPerRequest)}
      </td>
    </tr>
  );
}

function CostCard({
  calculation,
}: {
  calculation: CostCalculationResult;
}) {
  const { tierDefinition, baseCost, tokenCost, totalCost, costPerRequest, overageCost } =
    calculation;

  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{tierDefinition.name}</CardTitle>
          <Badge variant="secondary">{tierDefinition.monthlyRequests.toLocaleString()} requests</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{tierDefinition.description}</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Base Cost:</span>
          <span className="font-medium">{formatCost(baseCost)}</span>
        </div>
        {tokenCost > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Token Cost:</span>
            <span className="font-medium">{formatCost(tokenCost)}</span>
          </div>
        )}
        {overageCost && overageCost > 0 && (
          <div className="flex justify-between text-amber-600 dark:text-amber-400">
            <span>Overage:</span>
            <span className="font-medium">{formatCost(overageCost)}</span>
          </div>
        )}
        <div className="pt-2 border-t flex justify-between">
          <span className="font-semibold">Total Monthly:</span>
          <span className="font-bold text-lg">{formatCost(totalCost)}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Per Request:</span>
          <span>{formatCost(costPerRequest)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

