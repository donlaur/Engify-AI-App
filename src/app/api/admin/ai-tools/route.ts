/**
 * AI Tools Management API
 * 
 * CRUD operations for AI development tools registry
 * RBAC: Admin/Super Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RBACPresets } from '@/lib/middleware/rbac';
import { auditLog } from '@/lib/logging/audit';
import { aiToolService } from '@/lib/services/AIToolService';
import { AIToolSchema, AITool } from '@/lib/db/schemas/ai-tool';
import { z } from 'zod';

// GET: List all tools
export async function GET(request: NextRequest) {
  const r = await RBACPresets.requireSuperAdmin()(request);
  if (r) {
    console.error('❌ [AI-TOOLS-API] RBAC check failed:', r.status);
    return r;
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as AITool['category'] | null;
    const status = searchParams.get('status') as AITool['status'] | null;

    let tools;

    if (category) {
      tools = await aiToolService.findByCategory(category);
    } else if (status) {
      tools = await aiToolService.find({ status });
    } else {
      tools = await aiToolService.find({});
    }

    console.log(`✅ [AI-TOOLS-API] Found ${tools.length} tools in database`);

    return NextResponse.json({
      success: true,
      tools: tools.map((tool) => ({
        ...tool,
        _id: tool._id?.toString(),
      })),
    });
  } catch (error) {
    console.error('❌ [AI-TOOLS-API] Error fetching AI tools:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tools',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST: Create or update tool
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
    const validated = AIToolSchema.parse({
      ...body,
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
      updatedAt: new Date(),
      lastUpdated: body.lastUpdated ? new Date(body.lastUpdated) : new Date(),
    });

    // Upsert tool
    const tool = await aiToolService.upsert(validated);

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'admin_action',
      resource: `ai_tool:${tool.id}`,
      details: { toolId: tool.id, category: tool.category, action: 'tool_created' },
    });

    return NextResponse.json({
      success: true,
      tool: {
        ...tool,
        _id: tool._id?.toString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating/updating AI tool:', error);
    return NextResponse.json(
      { error: 'Failed to save tool' },
      { status: 500 }
    );
  }
}

// PATCH: Update tool properties
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
        { error: 'Tool ID required' },
        { status: 400 }
      );
    }

    let tool: AITool | null = null;

    // Handle special actions
    if (action === 'deprecate') {
      const existing = await aiToolService.findById(id);
      if (!existing) {
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        );
      }
      tool = await aiToolService.updateOne(existing._id!.toString(), {
        status: 'deprecated',
        updatedAt: new Date(),
      });
    } else if (action === 'toggle-status') {
      const existing = await aiToolService.findById(id);
      if (!existing) {
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        );
      }
      const newStatus = updateData.status || (existing.status === 'active' ? 'deprecated' : 'active');
      tool = await aiToolService.updateOne(existing._id!.toString(), {
        status: newStatus,
        updatedAt: new Date(),
      });
    } else {
      // Regular update
      const existing = await aiToolService.findById(id);
      if (!existing) {
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        );
      }

      tool = await aiToolService.updateOne(existing._id!.toString(), {
        ...updateData,
        updatedAt: new Date(),
        lastUpdated: new Date(),
      });
    }

    if (!tool) {
      return NextResponse.json(
        { error: 'Failed to update tool' },
        { status: 500 }
      );
    }

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'admin_action',
      resource: `ai_tool:${id}`,
      details: { action, ...updateData },
    });

    return NextResponse.json({
      success: true,
      tool: {
        ...tool,
        _id: tool._id?.toString(),
      },
    });
  } catch (error) {
    console.error('Error updating AI tool:', error);
    return NextResponse.json(
      { error: 'Failed to update tool' },
      { status: 500 }
    );
  }
}

// DELETE: Remove tool (soft delete by marking as deprecated)
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
        { error: 'Tool ID required' },
        { status: 400 }
      );
    }

    // Soft delete: mark as deprecated
    const existing = await aiToolService.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    const tool = await aiToolService.updateOne(existing._id!.toString(), {
      status: 'deprecated',
      updatedAt: new Date(),
    });
    
    if (!tool) {
      return NextResponse.json(
        { error: 'Failed to delete tool' },
        { status: 500 }
      );
    }

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'admin_action',
      resource: `ai_tool:${id}`,
      details: { action: 'tool_deleted' },
    });

    return NextResponse.json({
      success: true,
      message: 'Tool marked as deprecated',
    });
  } catch (error) {
    console.error('Error deleting AI tool:', error);
    return NextResponse.json(
      { error: 'Failed to delete tool' },
      { status: 500 }
    );
  }
}

