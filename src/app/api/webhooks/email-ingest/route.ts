import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  
  // TODO: Process with SendGrid Inbound Parse
  // TODO: Extract email content
  // TODO: Send to AI processing pipeline
  
  return NextResponse.json({ success: true });
}
