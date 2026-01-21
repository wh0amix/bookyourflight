import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/roles';

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: Get all available flights
 *     description: Returns a paginated list of all available flights with optional filters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Search in flight name or description
 *     responses:
 *       200:
 *         description: List of flights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resource'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    console.log('🔍 Fetching resources - page:', page, 'limit:', limit, 'search:', search);

    const [data, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.resource.count({ where }),
    ]);

    console.log('✅ Found', data.length, 'resources, total:', total);

    return NextResponse.json(
      {
        data,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: Create a new flight (Admin only)
 *     description: Creates a new flight resource. Requires admin role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - maxSlots
 *               - priceInCents
 *               - currency
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [FLIGHT]
 *               maxSlots:
 *                 type: integer
 *               priceInCents:
 *                 type: integer
 *               currency:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Flight created successfully
 *       403:
 *         description: Not authorized (admin role required)
 *       400:
 *         description: Invalid input
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      name,
      description,
      type,
      maxSlots,
      priceInCents,
      currency,
      metadata,
    } = body;

    if (!name || !type || !maxSlots || !priceInCents || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        description,
        type,
        availableSlots: maxSlots,
        maxSlots,
        priceInCents,
        currency,
        metadata: metadata || {},
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating resource:', error);
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}
