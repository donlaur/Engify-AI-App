import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION || 'us-east-2',
});

export async function invokeLambda(
  functionName: string,
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const command = new InvokeCommand({
    FunctionName: functionName,
    Payload: JSON.stringify(payload),
  });

  const response = await lambdaClient.send(command);
  
  if (response.FunctionError) {
    throw new Error(`Lambda error: ${response.FunctionError}`);
  }

  if (!response.Payload) {
    throw new Error('Empty response from Lambda');
  }

  const result = JSON.parse(
    new TextDecoder().decode(response.Payload)
  );

  return JSON.parse(result.body || '{}');
}

