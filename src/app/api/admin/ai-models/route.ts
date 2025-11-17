/**
 * AI Models Management API
 * 
 * CRUD operations for AI model registry
 * RBAC: Admin/Super Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RBACPresets } from '@/lib/middleware/rbac';
import { auditLog } from '@/lib/logging/audit';
import { aiModelService } from '@/lib/services/AIModelService';
import { AIModelSchema, AIModel } from '@/lib/db/schemas/ai-model';
import { z } from 'zod';

// GET: List all models
export async function GET(request: NextRequest) {
  const r = await RBACPresets.requireSuperAdmin()(request);
  if (r) {
    console.error('❌ [AI-MODELS-API] RBAC check failed:', r.status);
    return r;
  }

  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') as AIModel['provider'] | null;
    const status = searchParams.get('status') as AIModel['status'] | null;
    const allowed = searchParams.get('allowed');

    let models;

    if (provider) {
      models = await aiModelService.findByProvider(provider);
    } else if (status) {
      models = await aiModelService.find({ status });
    } else if (allowed === 'true') {
      models = await aiModelService.findAllowed();
    } else {
      models = await aiModelService.find({});
    }

    console.log(`✅ [AI-MODELS-API] Found ${models.length} models in database`);

    return NextResponse.json({
      success: true,
      models: models.map((model) => ({
        ...model,
        _id: model._id?.toString(),
      })),
    });
  } catch (error) {
    console.error('❌ [AI-MODELS-API] Error fetching AI models:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch models',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST: Create or update model
export async function POST(request: NextRequest) {
  const r = await RBACPresets.requireSuperAdmin()(request);
  if (r) return r;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate with Zod
    const validated = AIModelSchema.parse({
      ...body,
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
      updatedAt: new Date(),
    });

    // Upsert model
    const model = await aiModelService.upsert(validated);

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'admin_action',
      resource: `ai_model:${model.id}`,
      details: { modelId: model.id, provider: model.provider, action: 'model_created' },
    });

    return NextResponse.json({
      success: true,
      model: {
        ...model,
        _id: model._id?.toString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating/updating AI model:', error);
    return NextResponse.json(
      { error: 'Failed to save model' },
      { status: 500 }
    );
  }
}

// PATCH: Update model properties
export async function PATCH(request: NextRequest) {
  const r = await RBACPresets.requireSuperAdmin()(request);
  if (r) return r;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Model ID required' },
        { status: 400 }
      );
    }

    let model: AIModel | null = null;

    // Handle special actions
    if (action === 'deprecate') {
      model = await aiModelService.deprecate(
        id,
        updateData.replacementModel,
        updateData.sunsetDate ? new Date(updateData.sunsetDate) : undefined
      );
    } else if (action === 'toggle-allowed') {
      model = await aiModelService.setAllowed(id, updateData.allowed);
    } else {
      // Regular update
      const existing = await aiModelService.findById(id);
      if (!existing) {
        return NextResponse.json(
          { error: 'Model not found' },
          { status: 404 }
        );
      }

      model = await aiModelService.updateOne(existing._id!.toString(), updateData);
    }

    if (!model) {
      return NextResponse.json(
        { error: 'Failed to update model' },
        { status: 500 }
      );
    }

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'admin_action',
      resource: `ai_model:${id}`,
      details: { action, ...updateData },
    });

    return NextResponse.json({
      success: true,
      model: {
        ...model,
        _id: model._id?.toString(),
      },
    });
  } catch (error) {
    console.error('Error updating AI model:', error);
    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 }
    );
  }
}

// DELETE: Remove model (soft delete by marking as sunset)
export async function DELETE(request: NextRequest) {
  const r = await RBACPresets.requireSuperAdmin()(request);
  if (r) return r;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Model ID required' },
        { status: 400 }
      );
    }

    // Soft delete: mark as sunset
    const model = await aiModelService.deprecate(id, undefined, new Date());
    
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'admin_action',
      resource: `ai_model:${id}`,
      details: { action: 'model_deleted' },
    });

    return NextResponse.json({
      success: true,
      message: 'Model marked as sunset',
    });
  } catch (error) {
    console.error('Error deleting AI model:', error);
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    );
  }
}

